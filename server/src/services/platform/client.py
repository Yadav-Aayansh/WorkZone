from src.repository.platform import ClientRepository
from src.schemas.platform import (
    ClientSignupRequest, ClientOnboarding, ClientLoginRequest,
    CreateOrder, TenantAvailabilityRequest, ClientRefreshRequest)
from src.exceptions.platform import (
    ClientAlreadyExistsError, TenantAlreadyExistsError, ClientNotFoundError,
    InvalidClientCredentialsError, TenantNotFoundError
)
from src.utils.hashing import hash_password, verify_password
from src.core.storage import storage_client
from fastapi import UploadFile
from src.models.platform import Client
from src.utils.constants import AccountStatus, SubscriptionStatus
from src.utils.datetime import get_indian_time
from src.core.security import create_tokens, decode_token
from src.core.config import Config
from datetime import timedelta

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
        return {"available": is_exist}

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

        account_status = self.get_account_status(client)
        subscription_status = self.get_subscription_status(client)

        return {"account_status": account_status, "subscription_status": subscription_status}

    async def activate_subscription(self, id: str, subscription: CreateOrder):
        plan_started_at = get_indian_time()
        plan_expires_at = plan_started_at + timedelta(days=subscription.plan.validity*30)

        client = await self.client_repo.update_subscription(
            id=id,
            plan=subscription.plan,
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
        is_tenant_exist = await self.client_repo.is_domain_exist(tenant_or_domain)
        if is_tenant_exist:
            return tenant_or_domain
        
        is_domain_exist = await self.client_repo.is_domain_exist(tenant_or_domain)
        if is_domain_exist:
            return await self.client_repo.get_tenant_by_domain(is_tenant_exist)
        
        raise TenantNotFoundError("Tenant does not exist!")
            









