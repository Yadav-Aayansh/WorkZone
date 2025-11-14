from pydantic import BaseModel
from uuid import UUID

class RecruiterProfileResponse(BaseModel):
    user_id: UUID
    recruiter_id: UUID
    email: str
    name: str
    # department: str
    # position: str