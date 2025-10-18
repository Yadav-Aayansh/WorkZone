from fastapi import Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_public_db
from src.repository.platform import ClientRepository, OrderRepository
from src.services.platform import ClientService, OrderService
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

