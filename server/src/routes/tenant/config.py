from fastapi import APIRouter, Depends, HTTPException
from src.core.di import get_tenant_id, get_client_service
from src.services.platform import ClientService
from src.exceptions.platform import TenantNotFoundError

config_router = APIRouter(tags=["Configuration"])

@config_router.get(path="/config")
async def config(
    tenant_id = Depends(get_tenant_id),
    service: ClientService = Depends(get_client_service)
):
    try:
        return await service.get_tenant_config(tenant_id)
    except TenantNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))