from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class CreateQueryRequest(BaseModel):
    query_text: str

class RespondQueryRequest(BaseModel):
    response_text: str

class QueryResponse(BaseModel):
    id: UUID
    category: Optional[str] = None
    urgency: str
    status: str
    ai_summary: Optional[str] = None