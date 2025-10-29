import uuid
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from src.utils.datetime import get_indian_time

class Applicant(TenantBase):
    __tablename__ = "applicants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    user = relationship("User", back_populates="applicant", uselist=False)