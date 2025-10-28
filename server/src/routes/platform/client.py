from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File
from src.services.platform import ClientService, OrderService, WorkspaceService
from src.core.di import get_client_service, get_current_user, get_order_service, get_workspace_service
from src.schemas.platform import (
    ClientOnboarding,CreateOrder, UpdateOrder, TenantAvailabilityRequest,
    InviteRequest
)
from src.core.config import Config
from src.exceptions.platform import TenantAlreadyExistsError
from src.exceptions.tenant import UserAlreadyExistsError

client_router = APIRouter(tags=["Client"])

@client_router.post(path="/onboarding")
async def onboarding(
    tenant_id: str = Form(...),
    brand_name: str = Form(...),
    logo: UploadFile = File(...),
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user(Config.DOMAIN_NAME))
):
    try:
        data = ClientOnboarding(tenant_id=tenant_id, brand_name=brand_name)
        id = current_user.get("sub")
        response = await service.onboarding(id, data, logo)
        return response
    except TenantAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))


@client_router.get(path="/tenant-availability")
async def check_tenant_availability(
    data: TenantAvailabilityRequest = Depends(),
    service: ClientService = Depends(get_client_service)
):
    return await service.check_tenant_availability(data)

@client_router.get(path="/subscription")
async def create_order(
    data: CreateOrder,
    service: OrderService = Depends(get_order_service)
):
    return await service.create_order(data)

@client_router.post(path="/subscription")
async def update_order(
    data: UpdateOrder,
    service: OrderService = Depends(get_order_service)
):
    return await service.update_order(data)

@client_router.post(path="/invite")
async def invite(
    data: InviteRequest,
    service: WorkspaceService = Depends(get_workspace_service),
    current_user = Depends(get_current_user(Config.DOMAIN_NAME)),
):
    try:
        id = current_user.get("sub")
        return await service.invite(id, data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


