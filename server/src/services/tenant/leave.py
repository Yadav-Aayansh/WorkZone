from uuid import UUID
from datetime import date
from src.models.tenant import LeaveRequestStatus
from src.schemas.tenant import ApplyLeaveRequest
from src.repository.tenant import (
    LeaveEntitlementRepository, LeaveRequestRepository, EmployeeRepository,
    ManagerRepository )
from src.exceptions.tenant import (
    EmployeeNotFoundError, InsufficientLeaveBalanceError, LeaveRequestNotFoundError,
    UnauthorizedAccessError, InvalidLeaveActionError, ManagerNotFoundError )
from src.utils.datetime import get_indian_year

class LeaveService:
    def __init__(
            self,
            employee_repo: EmployeeRepository,
            manager_repo: ManagerRepository,
            leave_entitlement_repo: LeaveEntitlementRepository, 
            leave_request_repo: LeaveRequestRepository
    ):
        self.employee_repo = employee_repo
        self.manager_repo = manager_repo
        self.leave_entitlement_repo = leave_entitlement_repo
        self.leave_request_repo = leave_request_repo

    async def apply_leave(self, user_id: str, data: ApplyLeaveRequest):
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee does not exist!")
        
        current_year = get_indian_year()
        entitlement = await self.leave_entitlement_repo.get(employee.id, current_year)

        days = (data.end_date - data.start_date).days + 1
        balance = entitlement.balance.get(data.leave_type.value)
        if balance < days:
            raise InsufficientLeaveBalanceError(f"Insufficient {data.leave_type.value} leave balance. Available: {balance}, Requested: {days}")
        
        return await self.leave_request_repo.create(
            employee_id=employee.id,
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            reason=data.reason,
            manager_id=employee.manager_id
        )
    

    async def _validate_manager_action(self, leave_request_id: UUID, user_id: UUID):
        leave_request = await self.leave_request_repo.get_by_id(leave_request_id)
        if not leave_request:
            raise LeaveRequestNotFoundError("Leave request not found!")

        manager = await self.manager_repo.get_manager_by_user_id(user_id)
        if not manager:
            raise ManagerNotFoundError("Manager does not exist!")
        
        if leave_request.manager_id != manager.id:
            raise UnauthorizedAccessError("Access Denied!")
        
        if leave_request.status != LeaveRequestStatus.PENDING:
            raise InvalidLeaveActionError(f"Request already {leave_request.status.value}")

        return leave_request, manager
    
    async def approve_leave(self, leave_request_id: UUID, user_id: UUID):
        leave_request, _ = await self._validate_manager_action(leave_request_id, user_id)

        days = (leave_request.end_date - leave_request.start_date).days + 1
        fiscal_year = leave_request.start_date.year

        entitlement = await self.leave_entitlement_repo.get(leave_request.employee_id, fiscal_year)
        await self.leave_entitlement_repo.update_leaves(entitlement.id, leave_request.leave_type.value, days)

        return await self.leave_request_repo.update_status(leave_request_id, LeaveRequestStatus.APPROVED)


    async def reject_leave(self, leave_request_id: UUID, user_id: UUID, reason: str):
        leave_request, _ = await self._validate_manager_action(leave_request_id, user_id)
        return await self.leave_request_repo.update_status(leave_request_id, LeaveRequestStatus.REJECTED, reason)
        
    async def get_employee_request_leaves(self, user_id: str):
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee does not exist!")
        
        return await self.leave_request_repo.get_employee_requests(employee.id)
    
    async def get_manager_pending_approvals(self, user_id: str):
        manager = await self.manager_repo.get_manager_by_user_id(user_id)
        if not manager:
            raise ManagerNotFoundError("Manager does not exist!")
        
        return await self.leave_request_repo.get_pending_for_manager(manager.id)
    
    async def get_employee_leave_balance(self, user_id: str):
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee does not exist!")
        
        current_year = get_indian_year()
        entitlement = await self.leave_entitlement_repo.get(employee.id, current_year)
        return entitlement.balance