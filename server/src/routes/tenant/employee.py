from fastapi import APIRouter, Depends
from src.services.tenant import EmployeeService
from src.core.di import get_employee_service, get_current_user
from src.models.tenant import Role

employee_router = APIRouter(prefix="/employee", tags=["Tenant Employee"])

@employee_router.get(path="/me")
async def employee_profile(
    service: EmployeeService = Depends(get_employee_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    user_id = current_user.get("sub")
    return await service.profile(user_id)