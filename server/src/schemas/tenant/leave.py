from uuid import UUID
from pydantic import BaseModel
from datetime import date
from typing import Text
from src.models.tenant import LeaveRequestType, LeaveRequestStatus

class ApplyLeaveRequest(BaseModel):
    leave_type: LeaveRequestType
    start_date: date
    end_date: date
    reason: Text

class RejectLeaveRequest(BaseModel):
    rejection_reason: Text

class LeaveRequestResponse(BaseModel):
    id: UUID
    employee_id: UUID
    manager_id: UUID
    leave_type: LeaveRequestType
    status: LeaveRequestStatus
    start_date: date
    end_date: date
    reason: str
    rejection_reason: str | None = None