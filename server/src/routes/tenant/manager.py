from fastapi import APIRouter, Depends, HTTPException
from src.services.tenant import ManagerService
from src.core.di import get_manager_service, get_current_user
from src.models.tenant import Role
from src.exceptions.tenant import UserNotFoundError, ManagerNotFoundError

manager_router = APIRouter(prefix="/manager", tags=["Tenant Manager"])

@manager_router.get(path="/me")
async def manager_profile(
    service: ManagerService = Depends(get_manager_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.MANAGER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.profile(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ManagerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))