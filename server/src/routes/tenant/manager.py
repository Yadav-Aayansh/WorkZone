from fastapi import APIRouter, Depends
from src.services.tenant import ManagerService
from src.core.di import get_manager_service, get_current_user
from src.models.tenant import Role

manager_router = APIRouter(prefix="/manager", tags=["Tenant Manager"])

@manager_router.get(path="/me")
async def manager_profile(
    service: ManagerService = Depends(get_manager_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.MANAGER]))
):
    user_id = current_user.get("sub")
    return await service.profile(user_id)