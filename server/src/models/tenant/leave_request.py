import uuid, enum
from sqlalchemy.orm import relationship
from src.core.database import TenantBase
from sqlalchemy import Column, String, Date, Text, Enum, UUID, ForeignKey

class LeaveRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class LeaveRequestType(str, enum.Enum):
    CASUAL = "casual"
    SICK = "sick"
    EARNED = "earned"
    MATERNITY = "maternity"
    PATERNITY = "paternity"

class LeaveRequest(TenantBase):
    __tablename__ = "leave_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("managers.id"), nullable=False)
    leave_type = Column(Enum(LeaveRequestType), nullable=False)
    status = Column(Enum(LeaveRequestStatus), default=LeaveRequestStatus.PENDING)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text)
    rejection_reason = Column(Text)

    employee = relationship("Employee", back_populates="leave_requests")
