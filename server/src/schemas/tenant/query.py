from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class CreateQueryRequest(BaseModel):
    query_text: str

class RespondQueryRequest(BaseModel):
    response_text: str

class QueryResponse(BaseModel):
    id: UUID
    query_text: str
    response_text: Optional[str] = None
    category: Optional[str] = None
    urgency: str
    status: str
    sentiment: Optional[str] = None
    ai_summary: Optional[str] = None

class QueryResolutionResponse(BaseModel):
    message: str
    query_id: UUID
    status: str