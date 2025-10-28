from fastapi import Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_public_db, get_schema
from src.repository.platform import ClientRepository, OrderRepository
from src.repository.tenant import (
    UserRepository, ManagerRepository, RecruiterRepository,
    EmployeeRepository, ApplicantRepository
)
from src.services.platform import ClientService, OrderService, WorkspaceService
from src.services.tenant import UserService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.exceptions.base import RoleNotAllowedError
from .security import decode_token
from src.utils.misc import get_tenant_id_or_domain
from src.exceptions.platform import TenantNotFoundError
from .contex import tenant_context

def get_client_service(db: AsyncSession = Depends(get_public_db)):
    repo = ClientRepository(db)
    return ClientService(repo)

def get_order_service(
    db: AsyncSession = Depends(get_public_db),
    client_service: ClientService = Depends(get_client_service)
):
    repo = OrderRepository(db)
    return OrderService(repo, client_service)

def get_workspace_service(db: AsyncSession = Depends(get_public_db)):
    client_repo = ClientRepository(db)
    return WorkspaceService(client_repo)
    

    
security_guard = HTTPBearer()

def get_current_user(audience: str, roles: list[str] | None = None):
    def dependency(credentials: HTTPAuthorizationCredentials = Depends(security_guard)):
        payload = decode_token(credentials.credentials, audience)
        
        if roles:
            if payload.get("role") not in roles:
                raise RoleNotAllowedError("Invalid role!")
        return payload
    return dependency

async def get_tenant_id(
    request: Request,
    client_service: ClientService = Depends(get_client_service)
) -> str:
    try:
        host = request.url.hostname
        tenant_or_domain = get_tenant_id_or_domain(host)
        tenant_id = await client_service.get_tenant(tenant_or_domain)
        tenant_context.set(tenant_id)
        return tenant_id
    except TenantNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

async def get_tenant_db():
    tenant_id = tenant_context.get()
    async for sesion in get_schema(tenant_id):
        yield sesion 


async def get_user_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    recruiter_repo = RecruiterRepository(db)
    manager_repo = ManagerRepository(db)
    employee_repo = EmployeeRepository(db)
    applicant_repo = ApplicantRepository(db)
    return UserService(user_repo, recruiter_repo, manager_repo, employee_repo, applicant_repo)