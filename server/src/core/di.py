from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_public_db
from src.repository.platform import ClientRepository, OrderRepository
from src.services.platform import ClientService, OrderService
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.exceptions.base import RoleNotAllowedError
from .security import decode_token


def get_client_service(db: AsyncSession = Depends(get_public_db),):
    repo = ClientRepository(db)
    return ClientService(repo)

def get_order_service(
    db: AsyncSession = Depends(get_public_db),
    client_service: ClientService = Depends(get_client_service)
):
    repo = OrderRepository(db)
    return OrderService(repo, client_service)



security_guard = HTTPBearer()

def get_current_user(audience: str, token_type: str = "access", roles: list[str] | None = None):
    def dependency(credentials: HTTPAuthorizationCredentials = Depends(security_guard)):
        payload = decode_token(credentials.credentials, audience, token_type)
        
        if roles:
            if payload.get("role") not in roles:
                raise RoleNotAllowedError("Invalid role!")
        return payload
    return dependency