from fastapi import APIRouter, Depends, HTTPException
from src.services.tenant import EmployeeService
from src.core.di import get_employee_service, get_current_user
from src.models.tenant import Role
from src.schemas.tenant import HelpdeskQuery
from src.exceptions.tenant import (
    UserNotFoundError, EmployeeNotFoundError
)

employee_router = APIRouter(prefix="/employee", tags=["Tenant Employee"])

@employee_router.get(path="/me")
async def employee_profile(
    service: EmployeeService = Depends(get_employee_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.profile(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@employee_router.post("/helpdesk") 
async def smart_helpdesk(
    data: HelpdeskQuery,
    service: EmployeeService = Depends(get_employee_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.helpdesk(user_id, data.query, data.chat_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) 


@employee_router.get(path="/team")
async def get_team(
    service: EmployeeService = Depends(get_employee_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.get_team(user_id)
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))