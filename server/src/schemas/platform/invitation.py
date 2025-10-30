from pydantic import BaseModel, EmailStr, Field
from src.models.tenant import Role

class InviteRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    role: Role