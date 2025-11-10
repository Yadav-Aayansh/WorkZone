from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from src.models.tenant import ApplicationStatus

class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    user_id: UUID
    status: ApplicationStatus
    resume: str
    applied_on: datetime
