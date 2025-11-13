# from pydantic import BaseModel, validator, Field
# from typing import List, Optional, Literal
# from src.utils.datetime import get_indian_time
# from datetime import datetime

# # INPUT SCHEMAS 

# class StartInterviewRequest(BaseModel):
#     session_id: str = Field(..., description="Interview session ID from backend")
#     resume_blob_name: str = Field(..., description="GCP storage blob name for resume PDF")
#     jd_text: str = Field(..., description="Job description in markdown format")
#     candidate_name: Optional[str] = Field(None, description="Candidate's name")
#     position: Optional[str] = Field(None, description="Position applied for")


# class ProcessTextAnswerRequest(BaseModel):
#     session_id: str = Field(..., description="Interview session ID")
#     answer_text: str = Field(..., min_length=1, description="Candidate's text answer")

# class GenerateReportRequest(BaseModel):
#     session_id: str = Field(..., description="Interview session ID")


# # INTERNAL SCHEMAS 

# class InterviewQuestion(BaseModel):
#     type: str = Field(..., description="Question type (technical/experience/behavioral)")
#     question: str = Field(..., description="Question text")
#     focus_area: str = Field(..., description="Focus area of the question")


# class QuestionResponse(BaseModel):
#     question_index: int
#     question: str
#     answer: str
#     timestamp: str


# class AnswerAnalysis(BaseModel):
#     score: int = Field(..., ge=1, le=10)
#     strength: str
#     weakness: str


# class DetailedQA(BaseModel):
#     question: str
#     answer: str
#     score: int = Field(..., ge=1, le=10)
#     strength: Optional[str] = None
#     weakness: Optional[str] = None


# #  OUTPUT SCHEMAS 

# class StartInterviewResponse(BaseModel):
#     session_id: str
#     first_question: InterviewQuestion
#     first_question_audio_url: str = Field(..., description="Signed URL for first question audio")
#     resume_text: str
#     jd_text: str
#     candidate_name: Optional[str]
#     position: Optional[str]
#     question_index: int = Field(default=0, description="Current question index")


# class ProcessAnswerResponse(BaseModel):
#     status: Literal["in_progress", "completed"]
#     next_question: Optional[InterviewQuestion] = None
#     next_question_audio_url: Optional[str] = Field(None, description="Signed URL for next question audio")
#     next_question_index: Optional[int] = None
#     total_questions_asked: int
#     transcription: Optional[str] = None  # Only for voice answers
#     completion_reason: Optional[Literal["max_questions", "poor_answers", "min_questions_reached"]] = Field(
#         None, 
#         description="Reason for interview completion: max_questions (reached 10), poor_answers (3+ 'I don't know'), or min_questions_reached"
#     )
#     poor_answer_count: Optional[int] = Field(None, description="Number of poor quality answers given")


# class InterviewReport(BaseModel):
#     session_id: str
#     candidate_name: str
#     position: str
#     overall_score: float = Field(..., ge=0, le=100)
#     strengths: List[str]
#     weaknesses: List[str]
#     technical_fit: str
#     communication_assessment: str
#     recommendations: str
#     detailed_qa: List[DetailedQA]


# class GenerateReportResponse(BaseModel):
#     report: InterviewReport
#     markdown_report: str = Field(..., description="Markdown formatted report")
#     markdown_url: str = Field(default="", description="Markdown URL (empty when not uploading to storage)")

# # SESSION DATA SCHEMA 

# class SessionData(BaseModel):
#     session_id: str
#     resume_text: str
#     jd_text: str
#     candidate_name: Optional[str]
#     position: Optional[str]
#     responses: List[QuestionResponse] = []
#     questions_asked: List[InterviewQuestion] = []
#     created_at: datetime = Field(default_factory=get_indian_time)
#     current_question_index: int = 0
    
#     class Config:
#         arbitrary_types_allowed = True

from pydantic import BaseModel, validator, Field
from typing import List, Optional, Literal
from src.utils.datetime import get_indian_time
from datetime import datetime

# INPUT SCHEMAS 

class StartInterviewRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID from backend")
    resume_blob_name: str = Field(..., description="GCP storage blob name for resume PDF")
    jd_text: str = Field(..., description="Job description in markdown format")
    candidate_name: Optional[str] = Field(None, description="Candidate's name")
    position: Optional[str] = Field(None, description="Position applied for")


class ProcessTextAnswerRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID")
    answer_text: str = Field(..., min_length=1, description="Candidate's text answer")


class GenerateReportRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID")


# INTERNAL SCHEMAS 

class InterviewQuestion(BaseModel):
    type: str = Field(..., description="Question type (technical/experience/behavioral)")
    question: str = Field(..., description="Question text")
    focus_area: str = Field(..., description="Focus area of the question")


class QuestionResponse(BaseModel):
    question_index: int
    question: str
    answer: str
    timestamp: str


class AnswerAnalysis(BaseModel):
    score: int = Field(..., ge=1, le=10)
    strength: str
    weakness: str


class DetailedQA(BaseModel):
    question: str
    answer: str
    score: int = Field(..., ge=1, le=10)
    strength: Optional[str] = None
    weakness: Optional[str] = None


#  OUTPUT SCHEMAS 

class StartInterviewResponse(BaseModel):
    session_id: str
    first_question: InterviewQuestion
    first_question_audio_url: str = Field(..., description="Signed URL for first question audio")
    resume_text: str
    jd_text: str
    candidate_name: Optional[str]
    position: Optional[str]
    question_index: int = Field(default=0, description="Current question index")


class ProcessAnswerResponse(BaseModel):
    status: Literal["in_progress", "completed", "clarification_needed"]
    next_question: Optional[InterviewQuestion] = None
    next_question_audio_url: Optional[str] = Field(None, description="Signed URL for next question audio")
    next_question_index: Optional[int] = None
    total_questions_asked: int
    transcription: Optional[str] = None  # Only for voice answers
    completion_reason: Optional[Literal["max_questions", "poor_answers", "min_questions_reached"]] = Field(
        None, 
        description="Reason for interview completion: max_questions (reached 10), poor_answers (3+ 'I don't know'), or min_questions_reached"
    )
    poor_answer_count: Optional[int] = Field(None, description="Number of poor quality answers given")
    clarification: Optional[str] = Field(None, description="Clarification text when candidate asks a clarifying question")
    is_clarification: Optional[bool] = Field(False, description="Whether this is a clarification response")


class InterviewReport(BaseModel):
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
    report: InterviewReport
    markdown_report: str = Field(..., description="Markdown formatted report")
    markdown_url: str = Field(default="", description="Markdown URL (empty when not uploading to storage)")

# SESSION DATA SCHEMA 

class SessionData(BaseModel):
    session_id: str
    resume_text: str
    jd_text: str
    candidate_name: Optional[str]
    position: Optional[str]
    responses: List[QuestionResponse] = []
    questions_asked: List[InterviewQuestion] = []
    created_at: datetime = Field(default_factory=get_indian_time)
    current_question_index: int = 0
    
    class Config:
        arbitrary_types_allowed = True