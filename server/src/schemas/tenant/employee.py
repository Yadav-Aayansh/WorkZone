from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class EmployeeProfileResponse(BaseModel):
    user_id: UUID
    employee_id: UUID
    email: str
    name: str
    # department: str
    # position: str

class EmployeeInfo(BaseModel):
    name: str
    title: str
    granted: dict
    used: dict
    balance: dict

class HelpdeskQuery(BaseModel):
    query: str
    chat_id: Optional[str] = None