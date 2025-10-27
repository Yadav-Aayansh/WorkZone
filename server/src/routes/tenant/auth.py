from fastapi import APIRouter, Depends, HTTPException
from src.schemas.platform import AcceptInviteRequest, AcceptInviteResponse
from src.core.di import get_tenant_auth_service
from src.services.tenant import TenantAuthService
from src.exceptions.base import ConflictError, NotFoundError, ValidationError

auth_router = APIRouter(prefix="/auth", tags=["Tenant Auth"])

@auth_router.post(path="/accept-invite", response_model=AcceptInviteResponse, status_code=201)
async def accept_invitation(
    data: AcceptInviteRequest,
    service: TenantAuthService = Depends(get_tenant_auth_service)
):
    try:
        response = await service.accept_invitation(data)
        return response
    except ConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

