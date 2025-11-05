"""
Pydantic schemas for WebSocket-based AI Interview system
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


# ========== INITIALIZATION ENDPOINT SCHEMAS ==========

class InitInterviewRequest(BaseModel):
    """Request to initialize an AI interview session (REST endpoint)"""
    application_id: str = Field(..., description="Application ID")
    resume_blob_name: str = Field(..., description="GCP storage blob name for resume PDF")
    jd_content: str = Field(..., description="Job description text")
    candidate_name: Optional[str] = Field(None, description="Candidate's name")
    position: Optional[str] = Field(None, description="Position applied for")
    num_questions: int = Field(default=3, ge=1, le=10, description="Number of questions to generate")


class InitInterviewResponse(BaseModel):
    """Response after initializing interview (REST endpoint)"""
    interview_id: str = Field(..., description="Unique interview session ID")
    websocket_url: str = Field(..., description="WebSocket connection URL")


# ========== WEBSOCKET MESSAGE SCHEMAS ==========

class WSMessageBase(BaseModel):
    """Base WebSocket message"""
    type: str = Field(..., description="Message type")
    timestamp: Optional[str] = Field(None, description="Message timestamp")


class WSTextAnswerMessage(WSMessageBase):
    """WebSocket message: Candidate sends text answer"""
    type: Literal["text_answer"] = "text_answer"
    answer: str = Field(..., description="Candidate's text answer")
    question_index: int = Field(..., ge=0, description="Current question index")


class WSAudioAnswerMessage(WSMessageBase):
    """WebSocket message: Candidate sends audio answer"""
    type: Literal["audio_answer"] = "audio_answer"
    audio_blob_name: str = Field(..., description="GCP storage blob name for audio")
    question_index: int = Field(..., ge=0, description="Current question index")


class WSQuestionMessage(WSMessageBase):
    """WebSocket message: Server sends question"""
    type: Literal["question"] = "question"
    question_index: int = Field(..., description="Question index")
    question_text: str = Field(..., description="Question text")
    question_audio_url: str = Field(..., description="Signed URL for question audio")
    total_questions: int = Field(..., description="Total number of questions")
    question_type: str = Field(..., description="Question type (technical/behavioral/etc)")


class WSStatusMessage(WSMessageBase):
    """WebSocket message: Server sends status update"""
    type: Literal["status"] = "status"
    status: str = Field(..., description="Status message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details")


class WSErrorMessage(WSMessageBase):
    """WebSocket message: Server sends error"""
    type: Literal["error"] = "error"
    error: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class WSCompletionMessage(WSMessageBase):
    """WebSocket message: Interview completed"""
    type: Literal["completion"] = "completion"
    message: str = Field(..., description="Completion message")
    report_url: Optional[str] = Field(None, description="Interview report URL")
    overall_score: Optional[float] = Field(None, description="Overall score")


class WSTranscriptionMessage(WSMessageBase):
    """WebSocket message: Server sends transcription of audio"""
    type: Literal["transcription"] = "transcription"
    transcription: str = Field(..., description="Transcribed text from audio")
