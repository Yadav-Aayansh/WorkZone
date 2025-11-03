import uuid
from src.core.database import TenantBase
from src.utils.datetime import get_indian_time
from sqlalchemy.orm import relationship
from sqlalchemy import Column, UUID, String, DateTime, Text, ForeignKey, Boolean

class Job(TenantBase):
    __tablename__ = "jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String(50), nullable=False)
    location = Column(String(25), nullable=False)
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_open = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    applications = relationship("Application", back_populates="job", lazy=True)