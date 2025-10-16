from fastapi import APIRouter, Depends, HTTPException
from src.schemas.platform import (
    ClientSignupRequest, ClientSignupResponse, ClientLoginRequest,
    ClientLoginResponse
)
from src.core.di import get_client_service
from src.services.platform import ClientService

from src.exceptions.platform import InvalidClientCredentialsError

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post(path="/signup", status_code=201, response_model=ClientSignupResponse)
async def registration(data: ClientSignupRequest, service: ClientService = Depends(get_client_service)):
    response = await service.register(data)
    return response


@auth_router.post(path="/login", response_model=ClientLoginResponse)
async def login(data: ClientLoginRequest, service: ClientService = Depends(get_client_service)):
    try:
        response = await service.login(data)
        return response
    except InvalidClientCredentialsError as e:
        raise HTTPException(status_code=401, detail=str(e))