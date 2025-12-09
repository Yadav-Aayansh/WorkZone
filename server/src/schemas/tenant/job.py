from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class CreateJobRequest(BaseModel):
    title: str = Field(..., max_length=50)
    description: str
    department: str = Field(..., max_length=50)
    location: str = Field(..., max_length=25)

class UpdateJobRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    department: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=25)
    is_open: Optional[bool] = None

class JobResponse(BaseModel):
    id: UUID
    title: str
    description: str
    department: str
    location: str
    is_open: bool
    created_at: datetime
    updated_at: datetime

class ListJobsRequest(BaseModel):
    search: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    is_open: Optional[bool] = None

class CloseJobRequest(BaseModel):
    top_x: int | None