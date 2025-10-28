from src.repository.platform import ClientRepository
from src.repository.tenant import UserRepository
from src.schemas.platform import (
    InviteRequest
)
from src.exceptions.tenant import UserAlreadyExistsError
from src.exceptions.platform import TenantNotFoundError
from src.core.security import create_access_token
from src.core.config import Config
from src.tasks.email import send_invite_email
from src.core.database import get_schema

class WorkspaceService:
    def __init__(self, client_repo: ClientRepository):
        self.client_repo = client_repo

    async def invite(self, id: str, data: InviteRequest):
        tenant_id = await self.client_repo.get_tenant_by_id(id)
        if not tenant_id:
            raise TenantNotFoundError("Tenant does not exist!")
        
        async for tenant_db in get_schema(tenant_id):
            self.user_repo = UserRepository(tenant_db)

            is_exist = await self.user_repo.is_email_exist(data.email)
            if is_exist:
                raise UserAlreadyExistsError(f"User {data.email} already exists!")
        
        client = await self.client_repo.get_client_by_id(id)
        token = create_access_token({
            "email": data.email,
            "role": data.role.value,
            "aud": f"{tenant_id}.{Config.DOMAIN_NAME}"
        }, expires_minutes=2592000)

        invite_link = f"https://{tenant_id}.{Config.DOMAIN_NAME}/api/auth/signup?token={token}"
        task = send_invite_email.delay(data.email, invite_link, client.brand_name)
        return {"message": "Invited!"}






