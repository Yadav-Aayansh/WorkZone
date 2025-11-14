from pydantic import BaseModel
from uuid import UUID

class EmployeeProfileResponse(BaseModel):
    user_id: UUID
    employee_id: UUID
    email: str
    name: str
    # department: str
    # position: str
