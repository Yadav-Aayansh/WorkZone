#Pydantic schemas, validates all inputs and outputs

from pydantic import BaseModel, validator, Field
from typing import List, Optional, Literal
from src.utils.datetime import get_indian_time
from datetime import datetime


# ========== INPUT SCHEMAS ==========

class StartInterviewRequest(BaseModel):
    """Request to start a new interview session"""
    resume_blob_name: str = Field(..., description="GCP storage blob name for resume PDF")
    jd_type: Literal["text", "pdf"] = Field(..., description="Type of job description")
    jd_content: str = Field(..., description="Plain text JD or GCP blob name for JD PDF")
    candidate_name: Optional[str] = Field(None, description="Candidate's name")
    position: Optional[str] = Field(None, description="Position applied for")
    num_questions: int = Field(default=3, ge=1, le=10, description="Number of questions to generate")
    
    @validator('jd_content')
    def validate_jd_content(cls, v, values):
        jd_type = values.get('jd_type')
        if jd_type == 'pdf' and len(v.strip()) < 3:
            raise ValueError('JD PDF blob name must be provided')
        return v


class ProcessTextAnswerRequest(BaseModel):
    """Request to process a text answer"""
    session_id: str = Field(..., description="Interview session ID")
    answer_text: str = Field(..., min_length=1, description="Candidate's text answer")
    current_question_index: int = Field(..., ge=0, description="Current question index")


class ProcessVoiceAnswerRequest(BaseModel):
    """Request to process a voice answer"""
    session_id: str = Field(..., description="Interview session ID")
    audio_blob_name: str = Field(..., description="GCP storage blob name for audio file")
    current_question_index: int = Field(..., ge=0, description="Current question index")


class GenerateReportRequest(BaseModel):
    """Request to generate final interview report"""
    session_id: str = Field(..., description="Interview session ID")


# ========== INTERNAL SCHEMAS ==========

class InterviewQuestion(BaseModel):
    """Single interview question"""
    type: str = Field(..., description="Question type (technical/experience/behavioral)")
    question: str = Field(..., description="Question text")
    focus_area: str = Field(..., description="Focus area of the question")


class QuestionResponse(BaseModel):
    """Single question-answer pair"""
    question_index: int
    question: str
    answer: str
    timestamp: str


class AnswerAnalysis(BaseModel):
    """Analysis of a single answer"""
    score: int = Field(..., ge=1, le=10)
    strength: str
    weakness: str


class DetailedQA(BaseModel):
    """Detailed Q&A with analysis"""
    question: str
    answer: str
    score: int = Field(..., ge=1, le=10)
    strength: Optional[str] = None
    weakness: Optional[str] = None


# ========== OUTPUT SCHEMAS ==========

class StartInterviewResponse(BaseModel):
    """Response after starting interview"""
    session_id: str
    questions: List[InterviewQuestion]
    first_question_audio_url: str = Field(..., description="Signed URL for first question audio")
    resume_text: str
    jd_text: str
    candidate_name: Optional[str]
    position: Optional[str]


class ProcessAnswerResponse(BaseModel):
    """Response after processing an answer"""
    status: Literal["in_progress", "completed"]
    next_question: Optional[str] = None
    next_question_audio_url: Optional[str] = Field(None, description="Signed URL for next question audio")
    next_question_index: Optional[int] = None
    followup_generated: bool = False
    total_questions: int
    question_type: Optional[str] = None
    transcription: Optional[str] = None  # Only for voice answers


class InterviewReport(BaseModel):
    """Final interview evaluation report"""
    session_id: str
    candidate_name: str
    position: str
    overall_score: float = Field(..., ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    technical_fit: str
    communication_assessment: str
    recommendations: str
    detailed_qa: List[DetailedQA]


class GenerateReportResponse(BaseModel):
    """Response with report and PDF"""
    report: InterviewReport
    pdf_url: str = Field(..., description="Signed URL for PDF report")


# ========== SESSION DATA SCHEMA ==========

class SessionData(BaseModel):
    """Internal session data storage"""
    session_id: str
    questions: List[InterviewQuestion]
    resume_text: str
    jd_text: str
    candidate_name: Optional[str]
    position: Optional[str]
    responses: List[QuestionResponse] = []
    created_at: datetime = Field(default_factory=get_indian_time)
    
    class Config:
        arbitrary_types_allowed = True
