from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List

class EmployeeProfileResponse(BaseModel):
    user_id: UUID
    employee_id: UUID
    name: str
    email: str
    title: str
    resume: str | None

class EmployeeInfo(BaseModel):
    name: str
    title: str
    granted: dict
    used: dict
    balance: dict

class HelpdeskQuery(BaseModel):
    query: str
    chat_id: Optional[str] = None


class EmployeeTeamInfo(BaseModel):
    name: str
    title: str

class EmployeeTeamResponse(BaseModel):
    manager: str
    employees: List[EmployeeTeamInfo]