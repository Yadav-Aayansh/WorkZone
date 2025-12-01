from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from src.core.di import get_current_user, get_leave_service
from src.services.tenant import LeaveService
from src.schemas.tenant import ApplyLeaveRequest, LeaveRequestResponse, RejectLeaveRequest
from src.models.tenant import Role
from src.exceptions.tenant import (
    InsufficientLeaveBalanceError, EmployeeNotFoundError, ManagerNotFoundError,
    LeaveRequestNotFoundError, UnauthorizedAccessError, InvalidLeaveActionError
)

leave_router = APIRouter(prefix="/leaves", tags=["Leave"])

# Employee endpoints
@leave_router.post(path="/apply", status_code=201, response_model=LeaveRequestResponse)
async def apply_leave(
    data: ApplyLeaveRequest,
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.apply_leave(user_id, data)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InsufficientLeaveBalanceError as e:
        raise HTTPException(status_code=409, detail=str(e))

@leave_router.get(path="/")
async def get_leave_requests(
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.get_employee_request_leaves(user_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@leave_router.get(path="/balance")
async def get_leave_balance(
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.get_employee_leave_balance(user_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# Manager endpoints
@leave_router.get(path="/pending-requests")
async def get_pending_leave_requests(
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.MANAGER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.get_manager_pending_approvals(user_id)
    except ManagerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    

@leave_router.post(path="/{leave_request_id}/approve", response_model=LeaveRequestResponse)
async def approve_leave(
    leave_request_id: UUID,
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.MANAGER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.approve_leave(leave_request_id, user_id)
    except ManagerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LeaveRequestNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except InvalidLeaveActionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@leave_router.post(path="/{leave_request_id}/reject", response_model=LeaveRequestResponse)
async def reject_leave(
    leave_request_id: UUID,
    data: RejectLeaveRequest,
    service: LeaveService = Depends(get_leave_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.MANAGER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.reject_leave(leave_request_id, user_id, data.rejection_reason)
    except ManagerNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except LeaveRequestNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except InvalidLeaveActionError as e:
        raise HTTPException(status_code=400, detail=str(e))