from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, model_validator
from src.models.tenant import Role

class InviteRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    role: Role
    title: str | None = None
    manager_id: UUID | None = None


    @model_validator(mode='after')
    def employee_validation(self):
        if self.role == Role.EMPLOYEE and self.manager_id is None:
            raise ValueError('Manager ID is required for employees!')
        
        if self.role == Role.EMPLOYEE and self.title is None:
            raise ValueError('Title is required for employees!')
        return self