from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class CreateJobRequest(BaseModel):
    title: str = Field(..., max_length=50)
    description: str
    department: str = Field(..., max_length=50)
    location: str = Field(..., max_length=25)

class JobResponse(BaseModel):
    id: UUID
    title: str
    description: str
    department: str
    location: str
    is_open: bool
    created_at: datetime
    updated_at: datetime
