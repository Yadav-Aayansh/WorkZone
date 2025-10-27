from pydantic import BaseModel, EmailStr, Field
from src.models.platform import InvitationRole, InvitationStatus
from datetime import datetime

class InviteRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    role: InvitationRole

class InviteResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AcceptInviteRequest(BaseModel):
    token: str
    name: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)

class AcceptInviteResponse(BaseModel):
    access_token: str
    refresh_token: str
    role: str
