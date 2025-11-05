import enum
import uuid
from src.utils.datetime import get_indian_time
from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, UUID, String, DateTime, ForeignKey, Enum, Text, Integer, JSON


class InterviewStatus(enum.Enum):
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    TIMEOUT = "timeout"
    ERROR = "error"


class AIInterview(TenantBase):
    __tablename__ = "ai_interviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id"), nullable=False)
    session_id = Column(String(255), unique=True, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.INITIATED)
    
    # Interview data
    resume_blob_name = Column(String(500), nullable=False)
    jd_content = Column(Text, nullable=False)
    candidate_name = Column(String(255))
    position = Column(String(255))
    
    # Session metadata
    questions = Column(JSON)  # Store generated questions
    responses = Column(JSON, default=list)  # Store Q&A pairs
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    completed_at = Column(DateTime(timezone=True))
    
    # Report
    report_url = Column(String(500))
    overall_score = Column(Integer)
