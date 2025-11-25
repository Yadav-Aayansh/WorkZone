from uuid import UUID
from enum import Enum
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import LeaveRequest
from sqlalchemy import select, and_
from src.models.tenant import LeaveRequestStatus

class LeaveRequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: UUID) -> LeaveRequest | None:
        result = await self.db.execute(select(LeaveRequest).where(LeaveRequest.id == id))
        return result.scalar_one_or_none()

    async def create(self, employee_id: UUID, leave_type: str, start_date: date, end_date: date, manager_id: UUID, reason: str) -> LeaveRequest:
        leave_request = LeaveRequest(
            employee_id=employee_id,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            manager_id=manager_id
        )
        self.db.add(leave_request)
        await self.db.commit()
        await self.db.refresh(leave_request)
        return leave_request
    
    async def update_status(self, id: UUID, status: Enum, rejection_reason: str = None) -> LeaveRequest:
        leave_request = await self.get_by_id(id)
        leave_request.status = status
        if rejection_reason:
            leave_request.rejection_reason = rejection_reason
        
        await self.db.commit()
        await self.db.refresh(leave_request)
        return leave_request
    
    async def get_employee_requests(self, employee_id: UUID) -> list[LeaveRequest]:
        result = await self.db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == employee_id)
            .order_by(LeaveRequest.start_date.desc())
        )
        return result.scalars().all()
    
    async def get_pending_for_manager(self, manager_id: UUID) -> list[LeaveRequest]:
        result = await self.db.execute(
            select(LeaveRequest).where(
                and_(
                    LeaveRequest.manager_id == manager_id,
                    LeaveRequest.status == LeaveRequestStatus.PENDING
                )
            ).order_by(LeaveRequest.start_date)
        )
        return result.scalars().all()
    