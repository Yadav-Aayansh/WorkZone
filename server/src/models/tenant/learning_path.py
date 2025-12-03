import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from src.core.database import TenantBase
from src.utils.datetime import get_indian_time

class LearningPath(TenantBase):
    __tablename__ = "learning_paths"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)

    career_goal = Column(String, nullable=False)
    current_role_snapshot = Column(String, nullable=True)
    resume_ref = Column(String, nullable=False)

    plan_data = Column(JSONB, nullable=False)

    status = Column(String, default="active", nullable=False) # 'active', 'completed', 'archived'

    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    employee = relationship("Employee", back_populates="learning_paths")