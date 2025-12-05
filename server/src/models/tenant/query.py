import enum
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.core.database import TenantBase
from src.utils.datetime import get_indian_time

from src.genai.schemas import QueryCategory, UrgencyLevel, Sentiment


class QueryStatus(enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"

class Query(TenantBase):
    __tablename__ = "queries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("recruiters.id"), nullable=False)

    query_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)  # null until hr responds

    # category, sentiment, and summary are nullable in case llm api fails
    category = Column(Enum(QueryCategory, native_enum=False), nullable=True)
    urgency = Column(Enum(UrgencyLevel, native_enum=False), default=UrgencyLevel.MEDIUM, nullable=False)
    sentiment = Column(Enum(Sentiment, native_enum=False), nullable=True)
    summary = Column(String, nullable=True) # Short 1-line summary from AI

    status = Column(Enum(QueryStatus, native_enum=False), default=QueryStatus.OPEN, nullable=False)

    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    employee = relationship("Employee", back_populates="queries")
    recruiter = relationship("Recruiter", back_populates="assigned_queries")  # assigned_queries instead of queries to prevent ambiguity if recruiter also acts as employee