from pydantic import BaseModel, EmailStr, Field
from src.models.platform import SubscriptionPlan

class ClientSignupRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

class ClientSignupResponse(BaseModel):
    access_token: str
    refresh_token: str
    account_status: str
    subscription_status: str

class ClientLoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

class ClientLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    account_status: str
    subscription_status: str

class ClientOnboarding(BaseModel):
    tenant_id: str = Field(..., max_length=50)
    brand_name: str = Field(..., max_length=100)