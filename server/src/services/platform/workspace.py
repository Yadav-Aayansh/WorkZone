from src.repository.platform import ClientRepository, SettingRepository
from src.repository.tenant import UserRepository
from src.schemas.platform import (
    InviteRequest, LeaveTypesRequest, LeaveTypesResponse
)
from src.exceptions.tenant import UserAlreadyExistsError
from src.exceptions.platform import TenantNotFoundError, SettingNotFoundError, SettingAlreadyExistsError
from src.core.security import create_access_token
from src.core.config import Config
from src.tasks import send_invite_email
from src.core.database import get_schema
from typing import Dict, Any
from uuid import UUID
from src.models.tenant import Role

class WorkspaceService:
    def __init__(self, client_repo: ClientRepository, setting_repo: SettingRepository):
        self.client_repo = client_repo
        self.setting_repo = setting_repo

    async def invite(self, client_id: str, data: InviteRequest):
        tenant_id = await self.client_repo.get_tenant_by_id(client_id)
        if not tenant_id:
            raise TenantNotFoundError("Tenant does not exist!")
        
        async for tenant_db in get_schema(tenant_id):
            self.user_repo = UserRepository(tenant_db)

            is_exist = await self.user_repo.is_email_exist(data.email)
            if is_exist:
                raise UserAlreadyExistsError(f"User {data.email} already exists!")
        
        client = await self.client_repo.get_client_by_id(client_id)

        payload = {
            "name": data.name,
            "email": data.email,
            "role": data.role.value,
            "aud": f"{tenant_id}.{Config.DOMAIN_NAME}"
        }
        
        if data.role == Role.EMPLOYEE:
            payload["manager_id"] = str(data.manager_id)

        token = create_access_token(payload, expires_minutes=2592000)

        invite_link = f"https://{tenant_id}.{Config.DOMAIN_NAME}/signup/invited?token={token}"
        task = send_invite_email.delay(data.email, invite_link, client.brand_name)
        return {"message": "Invited!"}
    

    async def get_leave_types(self, client_id: UUID) -> LeaveTypesResponse:
        setting = await self.setting_repo.get_or_create(client_id)
        return setting.leave_types
    
    async def create_leave_types(self, client_id: UUID, data: LeaveTypesRequest) -> LeaveTypesResponse:
        existing = await self.setting_repo.get_by_client_id(client_id)
        if existing:
            raise SettingAlreadyExistsError(f"Settings already exist for client")
        
        new_setting = await self.setting_repo.create(client_id, data.model_dump())
        return new_setting.leave_types
    
    async def update_leave_types(self, client_id: UUID, data: LeaveTypesRequest) -> LeaveTypesResponse: 
        setting = await self.setting_repo.get_by_client_id(client_id)
        if not setting:
            raise SettingNotFoundError(f"Setting not found!")
        updated_setting = await self.setting_repo.update_leave_types(client_id, data.model_dump())
        return updated_setting.leave_types






