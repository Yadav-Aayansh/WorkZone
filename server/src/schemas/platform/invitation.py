from pydantic import BaseModel, EmailStr, Field
from src.models.tenant import Role

class InviteRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    role: Role