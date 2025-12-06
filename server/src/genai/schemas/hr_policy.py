from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class ProcessDocumentRequest(BaseModel):
    chroma_db_path: str = Field(..., description="ChromaDB path: chroma_db/amazon_uuid123")
    document_blob_names: Optional[List[str]] = Field(
        None,
        description="List of blob names to process. If None, used in batch mode."
    )
    category: Optional[str] = Field(
        None,
        description="Document category: leave, payroll, benefits, policies. Auto-detected if None."
    )
    metadata: Optional[Dict] = Field(
        default_factory=dict,
        description="Additional metadata"
    )


class ProcessDocumentResponse(BaseModel):
    status: str  # "success" or "error"
    document_id: str  # Same as blob_name
    blob_name: str
    chunks_added: int
    processing_time: float
    message: str
    error: Optional[str] = None


class ChatRequest(BaseModel):
    query: str = Field(..., description="User's question")
    chat_id: Optional[str] = Field(None, description="Chat session ID (None for new chat)")
    user_info: Dict = Field(..., description="User context as JSON key-value pairs")
    chroma_db_path: str = Field(..., description="Tenant's ChromaDB path: chroma_db/amazon_uuid123")


class ChatResponse(BaseModel):
    chat_id: str
    answer: str
    sources: List[Dict]
    suggestions: List[str]
    current_topic: Optional[str] = None
    confidence: float = 0.0


class SuggestionsRequest(BaseModel):
    user_info: Dict = Field(..., description="User context")
    chat_id: Optional[str] = Field(None, description="Optional chat ID for contextual suggestions")


class SuggestionsResponse(BaseModel):
    for_you: List[str]
    categories: Dict[str, List[str]]


# Internal data models
class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str
    metadata: Optional[Dict] = None


class ChatSession(BaseModel):
    chat_id: str
    user_info: Dict
    messages: List[Message] = []
    context: Dict = Field(default_factory=dict)
    created_at: str
    last_activity: str


class DocumentChunk(BaseModel):
    text: str
    metadata: Dict
    chunk_id: Optional[str] = None


class RAGContext(BaseModel):
    query: str
    user_info: Dict
    conversation_history: List[Message]
    session_context: Dict
    chroma_db_path: str  


class RAGResult(BaseModel):
    answer: str
    sources: List[Dict]
    confidence: float
    extracted_context: Dict
    suggestions: List[str] = [] 

