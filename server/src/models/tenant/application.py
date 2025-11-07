import enum
import uuid
from src.utils.datetime import get_indian_time
from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, UUID, String, DateTime, ForeignKey, Enum

class ApplicationStatus(enum.Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    AI_INTERVIEW_SCHEDULED = "ai_interview_scheduled"
    AI_INTERVIEW_COMPLETED = "ai_interview_completed"
    HUMAN_INTERVIEW_SCHEDULED = "human_interview_scheduled"
    HUMAN_INTERVIEW_COMPLETED = "human_interview_completed"
    OFFERED = "offered"
    REJECTED = "rejected"
    HIRED = "hired"
    WITHDRAWN = "withdrawn"

class Application(TenantBase):
    __tablename__ = "applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    applied_on = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)

    job = relationship("Job", back_populates="applications", uselist=False, lazy=True)
