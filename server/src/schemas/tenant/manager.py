from pydantic import BaseModel
from uuid import UUID

class ManagerProfileResponse(BaseModel):
    user_id: UUID
    manager_id: UUID
    email: str
    name: str
    # department: str
    # position: str
