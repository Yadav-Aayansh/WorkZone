from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File, Response
from src.services.platform import ClientService, OrderService, WorkspaceService
from src.core.di import get_client_service, get_current_user, get_order_service, get_workspace_service
from src.schemas.platform import (
    ClientOnboarding,CreateOrder, UpdateOrder, TenantAvailabilityRequest,
    InviteRequest
)
from src.exceptions.platform import (
    TenantAlreadyExistsError, InvalidDomainError, ClientNotFoundError,
    DomainAlreadyExistsError, DomainNotVerifiedError, UnauthorizedAccessError
)
from src.exceptions.tenant import UserAlreadyExistsError
from src.exceptions.base import FileSizeExceededError, FileTypeNotAllowedError

client_router = APIRouter(tags=["Client"])

@client_router.post(path="/onboarding")
async def onboarding(
    tenant_id: str = Form(...),
    brand_name: str = Form(...),
    logo: UploadFile = File(...),
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user())
):
    try:
        data = ClientOnboarding(tenant_id=tenant_id, brand_name=brand_name)
        id = current_user.get("sub")
        response = await service.onboarding(id, data, logo)
        return response
    except TenantAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except FileTypeNotAllowedError as e:
        raise HTTPException(status_code=415, detail=str(e))
    except FileSizeExceededError as e:
        raise HTTPException(status_code=413, detail=str(e))


@client_router.get(path="/tenant-availability")
async def check_tenant_availability(
    data: TenantAvailabilityRequest = Depends(),
    service: ClientService = Depends(get_client_service)
):
    return await service.check_tenant_availability(data)

@client_router.get(path="/subscription")
async def create_order(
    data: CreateOrder = Depends(),
    service: OrderService = Depends(get_order_service),
    current_user = Depends(get_current_user())
):  
    client_id = current_user.get("sub")
    return await service.create_order(client_id, data)

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
    current_user = Depends(get_current_user()),
):
    try:
        id = current_user.get("sub")
        return await service.invite(id, data)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@client_router.post(path="/custom-domain/{domain}")
async def link_custom_domain(
    domain: str,
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user()),
):
    try:
        id = current_user.get("sub")
        return await service.link_custom_domain(id, domain)
    except InvalidDomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ClientNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DomainAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except DomainNotVerifiedError as e:
        raise HTTPException(status_code=400, detail=str(e))

@client_router.delete(path="/custom-domain/{domain}")
async def unlink_custom_domain(
    domain: str,
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user()),
):
    try:
        id = current_user.get("sub")
        return await service.unlink_custom_domain(id, domain)
    except InvalidDomainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ClientNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))

@client_router.get("/caddy-ask")
async def caddy_ask(
    domain: str,
    service: ClientService = Depends(get_client_service)
):
    try:
        exists = await service.is_domain_linked(domain)
        if exists:
            return Response(status_code=200)
    except:
        pass
    
    return Response(status_code=403)


@client_router.get(path="/members")
async def get_all_members(
    service: ClientService = Depends(get_client_service),
    current_user = Depends(get_current_user()),
):
    try:
        id = current_user.get("sub")
        return await service.get_members(id)
    except ClientNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))