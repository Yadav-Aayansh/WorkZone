from pydantic import BaseModel
from uuid import UUID

class ApplicantProfileResponse(BaseModel):
    user_id: UUID
    applicant_id: UUID
    email: str
    name: str
    # department: str
    # position: str