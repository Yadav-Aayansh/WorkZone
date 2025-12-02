from uuid import UUID
from src.repository.platform import ClientRepository
from src.schemas.platform import (
    ClientSignupRequest, ClientOnboarding, ClientLoginRequest,
    TenantAvailabilityRequest, ClientRefreshRequest)
from src.exceptions.platform import (
    ClientAlreadyExistsError, TenantAlreadyExistsError, ClientNotFoundError,
    InvalidClientCredentialsError, TenantNotFoundError, InvalidDomainError,
    DomainAlreadyExistsError, DomainNotVerifiedError, UnauthorizedAccessError
)
from src.utils.hashing import hash_password, verify_password
from src.core.storage import storage_client
from fastapi import UploadFile
from src.models.platform import Client, SubscriptionPlan
from src.utils.constants import AccountStatus, SubscriptionStatus
from src.utils.datetime import get_indian_time
from src.utils.misc import is_valid_domain, verify_domain
from src.core.security import create_tokens, decode_token
from src.core.config import Config
from datetime import timedelta
from src.tasks import (
    create_tenant_schema_task, create_tenant_setting, link_domain_and_redirect_task,
    unlink_domain_task
)
from src.core.logger import logger

class ClientService:
    def __init__(self, client_repo: ClientRepository):
        self.client_repo = client_repo

    def get_account_status(self, client: Client) -> str:
        if not (client.tenant_id and client.brand_name):
            return AccountStatus.ONBOARDING
        elif not (client.plan_duration and client.plan_started_at):
            return AccountStatus.SUBSCRIPTION
        else:
            return AccountStatus.ACTIVE
        
    def get_subscription_status(self, client: Client) -> str:
        if not (client.plan_duration and client.plan_started_at):
            return SubscriptionStatus.NOT_STARTED
        elif get_indian_time() > client.plan_expires_at:
            return SubscriptionStatus.EXPIRED
        else:
            return SubscriptionStatus.ACTIVE
        
    async def check_tenant_availability(self, data: TenantAvailabilityRequest):
        is_exist = await self.client_repo.is_tenant_exist(data.tenant_id)
        return {"available": not is_exist}

    async def register(self, data: ClientSignupRequest):
        is_exist = await self.client_repo.get_client_by_email(data.email)
        if is_exist:
            raise ClientAlreadyExistsError(f"Email {data.email} already exists!")

        hashed_password = hash_password(data.password)
        client = await self.client_repo.create_client(
            name=data.name,
            email=data.email,
            password=hashed_password
        )

        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        tokens = create_tokens({
            "sub": str(client.id),
            "email": client.email,
            "aud": Config.DOMAIN_NAME
        })

        return {**tokens, "account_status": account_status, "subscription_status": subscription_status}

    async def onboarding(self, id: str, data: ClientOnboarding, logo: UploadFile):
        is_exist = await self.client_repo.is_tenant_exist(data.tenant_id)
        if is_exist:
            raise TenantAlreadyExistsError(f"Tenant ID {data.tenant_id} already exists!")
        
        storage_client.validate_file(logo, [".png", ".jpg", ".jpeg", ".webp"])
        blob_name, url = storage_client.upload(logo, "platform/logo")

        is_exist = await self.client_repo.get_client_by_id(id)
        if not is_exist:
            raise ClientNotFoundError(f"Client {id} does not exist!")
        client = await self.client_repo.setup_onboarding(
            id=id,
            tenant_id=data.tenant_id,
            brand_name=data.brand_name,
            logo=blob_name
        )
        
        create_tenant_schema_task.delay(data.tenant_id)
        create_tenant_setting.delay(id)
        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        return {"account_status": account_status, "subscription_status": subscription_status}

    async def activate_subscription(self, id: str, plan: SubscriptionPlan):
        plan_started_at = get_indian_time()
        plan_expires_at = plan_started_at + timedelta(days=plan.validity*30)

        client = await self.client_repo.update_subscription(
            id=id,
            plan=plan,
            started_at=plan_started_at,
            expires_at=plan_expires_at
        )
        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        return {"account_status": account_status, "subscription_status": subscription_status}

    async def login(self, data: ClientLoginRequest):
        client = await self.client_repo.get_client_by_email(data.email)
        if not client:
            raise ClientNotFoundError("Account does not exist!")
        
        if not verify_password(data.password, client.password):
            raise InvalidClientCredentialsError("Incorrect email or password!")
        
        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        tokens = create_tokens({
            "sub": str(client.id),
            "email": client.email,
            "aud": Config.DOMAIN_NAME
        })

        return {**tokens, "account_status": account_status, "subscription_status": subscription_status}
    
    async def refresh(self, data: ClientRefreshRequest) -> dict:
        current_user = decode_token(data.refresh_token, Config.DOMAIN_NAME, "refresh")
        client = await self.client_repo.get_client_by_id(current_user.get("sub"))
        if not client:
            raise ClientNotFoundError("Account does not exist!")
        
        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        tokens = create_tokens({
            "sub": str(client.id),
            "email": client.email,
            "aud": Config.DOMAIN_NAME
        })

        return {**tokens, "account_status": account_status, "subscription_status": subscription_status}
    

    async def get_tenant(self, tenant_or_domain: str) -> str:
        is_tenant_exist = await self.client_repo.is_tenant_exist(tenant_or_domain)
        if is_tenant_exist:
            return tenant_or_domain
        
        is_domain_exist = await self.client_repo.is_domain_exist(tenant_or_domain)
        if is_domain_exist:
            return await self.client_repo.get_tenant_by_domain(tenant_or_domain)
        
        raise TenantNotFoundError("Tenant does not exist!")
    
    async def get_tenant_config(self, tenant_id: str) -> dict:
        is_tenant_exist = await self.client_repo.is_tenant_exist(tenant_id)
        if not is_tenant_exist:
            raise TenantNotFoundError("Tenant does not exist!")
        config = await self.client_repo.get_config(tenant_id)
        logger.info(f"Tenant Config: {config}")
        config["logo"] = storage_client.get_url(config["logo"])
        logger.info(f"Tenant Config: {config}")
        return config
    
    async def link_custom_domain(self, id: UUID, domain: str):
        if not is_valid_domain(domain):
            raise InvalidDomainError(f"Invalid domain: {domain}")
        
        client = await self.client_repo.get_client_by_id(id)
        if not client:
            raise ClientNotFoundError(f"Client {id} does not exist!")
        
        existing = await self.client_repo.is_domain_exist(domain)
        if existing:
            raise DomainAlreadyExistsError(f"Domain already linked!")
        
        tenant_subdomain = f"{client.tenant_id}.{Config.DOMAIN_NAME}"
        if not verify_domain(domain, tenant_subdomain):
            if domain.count('.') == 1:
                raise DomainNotVerifiedError(f"Add A record: {domain} → {Config.SERVER_IP}")
            else:
                raise DomainNotVerifiedError(
                    f"Add either:\n"
                    f"A record: {domain} → {Config.SERVER_IP}\n"
                    f"OR CNAME: {domain} → {tenant_subdomain}"
                )

        await self.client_repo.add_custom_domain(id, domain)
        link_domain_and_redirect_task.delay(domain, tenant_subdomain)

    async def unlink_custom_domain(self, id: UUID, domain: str):
        if not is_valid_domain(domain):
            raise InvalidDomainError(f"Invalid domain: {domain}")
        
        client = await self.client_repo.get_client_by_id(id)
        if not client:
            raise ClientNotFoundError(f"Client {id} does not exist!")
        
        if client.domain != domain:
            raise UnauthorizedAccessError("Access denied!")
        
        self.client_repo.remove_custom_domain(id, domain)
        unlink_domain_task.delay(domain, f"{client.tenant_id}.{Config.DOMAIN_NAME}")

    
    async def is_domain_linked(self, domain: str):
        if not is_valid_domain(domain):
            raise InvalidDomainError(f"Invalid domain: {domain}")
        return await self.client_repo.is_domain_exist(domain)

            









