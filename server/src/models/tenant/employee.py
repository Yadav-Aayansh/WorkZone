import uuid
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, DateTime, ForeignKey, String
from src.utils.datetime import get_indian_time

class Employee(TenantBase):
    __tablename__ = "employees"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(50), nullable=False)
    resume = Column(String(500), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("managers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    user = relationship("User", back_populates="employee", uselist=False)
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    leave_entitlements = relationship("LeaveEntitlement", back_populates="employee", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="employee", cascade="all, delete-orphan")
    queries = relationship("Query", back_populates="employee", cascade="all, delete-orphan")