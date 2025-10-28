from fastapi import APIRouter, Depends, HTTPException
from src.schemas.platform import (
    ClientSignupRequest, ClientSignupResponse, ClientLoginRequest,
    ClientLoginResponse, ClientRefreshRequest
)
from src.core.di import get_client_service, get_current_user
from src.services.platform import ClientService
from src.exceptions.platform import (
    InvalidClientCredentialsError, ClientAlreadyExistsError,
    ClientNotFoundError
)
from src.exceptions.base import (
    InvalidTokenError, ExpiredTokenError
)
from src.core.config import Config

auth_router = APIRouter(prefix="/auth", tags=["Client Auth"])

@auth_router.post(path="/signup", status_code=201, response_model=ClientSignupResponse)
async def registration(data: ClientSignupRequest, service: ClientService = Depends(get_client_service)):
    try:
        response = await service.register(data)
        return response
    except ClientAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))


@auth_router.post(path="/login", response_model=ClientLoginResponse)
async def login(data: ClientLoginRequest, service: ClientService = Depends(get_client_service)):
    try:
        response = await service.login(data)
        return response
    except InvalidClientCredentialsError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except ClientNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@auth_router.post(path="/refresh", response_model=ClientLoginResponse)
async def refresh(
    data: ClientRefreshRequest,
    service: ClientService = Depends(get_client_service)):
    try:
        return await service.refresh(data)
    except ExpiredTokenError as e:
        raise HTTPException(status_code=401, detail="Expired token!")
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token!")