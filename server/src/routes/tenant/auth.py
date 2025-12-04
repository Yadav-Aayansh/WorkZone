from fastapi import APIRouter, Depends, HTTPException
from src.schemas.tenant import (
    UserSignupRequest, UserSignupInvitedRequest, UserLoginRequest,
    UserRefreshRequest, UserForgotPasswordRequest, UserResetPasswordRequest
)
from src.core.di import get_user_service
from src.services.tenant import UserService
from src.exceptions.tenant import (
    InvitationRequiredError, UserAlreadyExistsError, InvalidUserCredentialsError,
    UserNotFoundError
)

auth_router = APIRouter(prefix="/auth", tags=["Tenant Auth"])

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
async def signup_invited(
    data: UserSignupInvitedRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.register_invited(data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=403, detail=str(e))
    

@auth_router.post(path="/login", status_code=200)
async def login(
    data: UserLoginRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.login(data)
    except (UserNotFoundError, InvalidUserCredentialsError) as e:
        raise HTTPException(status_code=401, detail=str(e))
    

@auth_router.post(path="/refresh")
async def refresh(
    data: UserRefreshRequest,
    service: UserService = Depends(get_user_service)):
    try:
        return await service.refresh(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@auth_router.post(path="/forgot-password")
async def forgot_password(
    data: UserForgotPasswordRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.forgot_password(data)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@auth_router.post(path="/reset-password")
async def reset_password(
    data: UserResetPasswordRequest,
    service: UserService = Depends(get_user_service)
):
    try:
        return await service.reset_password(data)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))