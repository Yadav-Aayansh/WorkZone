from pydantic import BaseModel, EmailStr, Field
from src.models.tenant import Role

class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)
    role: Role

class UserSignupInvitedRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)

class UserSignupResponse(BaseModel):
    access_token: str
    refresh_token: str

class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

class UserLoginResponse(BaseModel):
    access_token: str
    refresh_token: str

class UserRefreshRequest(BaseModel):
    refresh_token: str