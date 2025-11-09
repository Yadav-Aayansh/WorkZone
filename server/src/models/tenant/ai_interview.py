import uuid
from src.utils.datetime import get_indian_time
from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, UUID, String, DateTime, ForeignKey, Numeric, Text

class AiInterview(TenantBase):
    __tablename__ = "ai_interviews"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    job_id = Column(String(255), nullable=False)
    overall_score = Column(Numeric(5, 2))
    report = Column(Text)
    created_at = Column(DateTime(timezone=True), default=get_indian_time)
    completed_at = Column(DateTime(timezone=True))
    
    application = relationship("Application", back_populates="ai_interview", uselist=False)