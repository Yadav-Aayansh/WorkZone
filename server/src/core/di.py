from fastapi import Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_public_db, get_tenant_db
from src.repository.platform import ClientRepository, OrderRepository, InvitationRepository
from src.repository.tenant import UserRepository
from src.services.platform import ClientService, OrderService, InvitationService
from src.services.tenant import TenantAuthService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.exceptions.base import RoleNotAllowedError
from .security import decode_token
from src.utils.misc import get_tenant_id_or_domain
from src.exceptions.platform import TenantNotFoundError

def get_client_service(db: AsyncSession = Depends(get_public_db)):
    repo = ClientRepository(db)
    return ClientService(repo)

def get_order_service(
    db: AsyncSession = Depends(get_public_db),
    client_service: ClientService = Depends(get_client_service)
):
    repo = OrderRepository(db)
    return OrderService(repo, client_service)

def get_invitation_service(
    db: AsyncSession = Depends(get_public_db)
):
    invitation_repo = InvitationRepository(db)
    client_repo = ClientRepository(db)
    return InvitationService(invitation_repo, client_repo)

async def get_user_repository(tenant_id: str = Depends(get_tenant_id)):
    async for db in get_tenant_db(tenant_id):
        yield UserRepository(db)

def get_tenant_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    invitation_service: InvitationService = Depends(get_invitation_service)
):
    return TenantAuthService(user_repo, invitation_service)

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
        return await client_service.get_tenant(tenant_or_domain)
    except TenantNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

