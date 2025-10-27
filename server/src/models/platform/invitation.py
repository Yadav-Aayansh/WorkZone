import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import PublicBase
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from src.utils.datetime import get_indian_time
from datetime import timedelta

class InvitationStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"

class InvitationRole(enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    RECRUITER = "recruiter"

class Invitation(PublicBase):
    __tablename__ = "invitations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(Enum(InvitationRole), nullable=False)
    token = Column(String(500), nullable=False, unique=True, index=True)
    status = Column(Enum(InvitationStatus), nullable=False, default=InvitationStatus.PENDING)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)
