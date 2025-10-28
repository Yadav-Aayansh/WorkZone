from fastapi import APIRouter, Depends, HTTPException
from src.schemas.tenant import UserSignupRequest, UserSignupInvitedRequest
from src.core.di import get_user_service
from src.services.tenant import UserService
from src.exceptions.tenant import InvitationRequiredError, UserAlreadyExistsError

auth_router = APIRouter(prefix="/api", tags=["Tenant Auth"])

@auth_router.post(path="/signup", status_code=201)
async def signup(
    data: UserSignupRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.register(data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except InvitationRequiredError as e:
        raise HTTPException(status_code=403, detail=str(e))


@auth_router.post(path="/signup/invited", status_code=201)
async def signup(
    data: UserSignupInvitedRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.register_invited(data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=403, detail=str(e))