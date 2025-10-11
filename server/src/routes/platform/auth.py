from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File
from src.schemas.platform import (
    ClientSignupRequest, ClientSignupResponse, ClientOnboarding,
    ClientLoginRequest, ClientLoginResponse
)
from src.core.di import get_client_service, get_current_user
from src.services.platform import ClientService
from src.core.config import Config
from src.exceptions.platform import InvalidClientCredentialsError

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post(path="/signup", status_code=201, response_model=ClientSignupResponse)
async def registration(data: ClientSignupRequest, service: ClientService = Depends(get_client_service)):
    response = await service.register(data)
    return response


@auth_router.post(path="/onboarding")
async def onboarding(
    tenant_id: str = Form(...),
    brand_name: str = Form(...),
    logo: UploadFile = File(...),
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user(Config.DOMAIN_NAME))
):
    data = ClientOnboarding(tenant_id=tenant_id, brand_name=brand_name)
    id = current_user.get("sub")
    response = await service.onboarding(id, data, logo)
    return response
    
@auth_router.post(path="/login", response_model=ClientLoginResponse)
async def login(data: ClientLoginRequest, service: ClientService = Depends(get_client_service)):
    try:
        response = await service.login(data)
        return response
    except InvalidClientCredentialsError as e:
        raise HTTPException(status_code=401, detail=str(e))




# @auth_router.post("/upload")
# async def upload(file: UploadFile):
#     content = await file.read()
#     blob_name, url = storage_client.upload(content, "test", file.filename, file.content_type)
#     return {"url": url, "blob_name": blob_name}