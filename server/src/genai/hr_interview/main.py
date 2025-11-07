from typing import Dict, List
from src.utils.datetime import get_indian_time

# Import schemas
from src.genai.schemas.hr_interview_schemas import (
    StartInterviewRequest,
    StartInterviewResponse,
    ProcessTextAnswerRequest,
    ProcessVoiceAnswerRequest,
    ProcessAnswerResponse,
    GenerateReportRequest,
    GenerateReportResponse,
    SessionData,
    QuestionResponse,
    InterviewQuestion
)

# Import modules
from src.genai.hr_interview.pdf_processor import extract_text_from_pdf
from src.genai.hr_interview.question_generator import generate_interview_questions, generate_followup_question
from src.genai.hr_interview.report_generator import generate_interview_report
from src.genai.hr_interview.tts_engine import text_to_speech
from src.genai.hr_interview.stt_engine import speech_to_text
from src.core.storage import storage_client


# upload markdown report to GCP Storage
def upload_markdown_report(markdown_content: str, session_id: str) -> str:
    import io
    
    # Create a file-like object from markdown string
    filename = f"{session_id}_report.md"
    markdown_bytes = markdown_content.encode('utf-8')
    markdown_file_obj = io.BytesIO(markdown_bytes)
    
    # Create a simple file-like object with required attributes
    class MarkdownFile:
        def __init__(self, filename, content):
            self.filename = filename
            self.file = io.BytesIO(content)
            self.content_type = "text/markdown"
    
    markdown_file = MarkdownFile(filename, markdown_bytes)
    
    # Upload to GCP Storage
    folder = f"interview_reports/{session_id}"
    blob_name, signed_url = storage_client.upload(markdown_file, folder, expiration=30)  # 30 days expiration
    
    return signed_url


# generate markdown report
def generate_markdown_report(report) -> str:
    """Convert InterviewReport to markdown format"""
    markdown = f"""# Interview Report

## Candidate Information
- **Name:** {report.candidate_name}
- **Position:** {report.position}
- **Session ID:** {report.session_id}
- **Overall Score:** {report.overall_score}/100

---

## Summary

### Strengths
"""
    for strength in report.strengths:
        markdown += f"- {strength}\n"
    
    markdown += "\n### Weaknesses\n"
    for weakness in report.weaknesses:
        markdown += f"- {weakness}\n"
    
    markdown += f"""
---

## Detailed Assessment

### Technical Fit
{report.technical_fit}

### Communication Skills
{report.communication_assessment}

### Recommendations
{report.recommendations}

---

## Interview Questions & Answers

"""
    for i, qa in enumerate(report.detailed_qa, 1):
        markdown += f"""### Question {i} (Score: {qa.score}/10)
**Q:** {qa.question}

**A:** {qa.answer}

**Strength:** {qa.strength}

**Weakness:** {qa.weakness}

---

"""
    
    return markdown


# In-memory session storage (replace with Redis/DB in production)
active_sessions: Dict[str, SessionData] = {}


async def start_interview(request: StartInterviewRequest) -> StartInterviewResponse:
    
    # Get signed URL for resume and extract text
    resume_signed_url = storage_client.get_url(request.resume_blob_name, expiration=1)
    if not resume_signed_url:
        raise ValueError(f"Resume not found: {request.resume_blob_name}")
    
    resume_text = await extract_text_from_pdf(resume_signed_url)
    
    # Extract or use JD text
    if request.jd_type == "pdf":
        jd_signed_url = storage_client.get_url(request.jd_content, expiration=1)
        if not jd_signed_url:
            raise ValueError(f"JD PDF not found: {request.jd_content}")
        jd_final = await extract_text_from_pdf(jd_signed_url)
    else:
        jd_final = request.jd_content
    
    # Use session_id from request (provided by backend)
    session_id = request.session_id
    
    # Generate interview questions
    questions = await generate_interview_questions(jd_final, resume_text, request.num_questions)
    
    # Generate audio for first question (returns signed URL)
    first_question_audio_url = await text_to_speech(
        questions[0].question,
        session_id,
        0
    )
    
    # Create session data
    session_data = SessionData(
        session_id=session_id,
        questions=questions,
        resume_text=resume_text,
        jd_text=jd_final,
        candidate_name=request.candidate_name,
        position=request.position,
        responses=[]
    )
    
    # Store session
    active_sessions[session_id] = session_data
    
    return StartInterviewResponse(
        session_id=session_id,
        questions=questions,
        first_question_audio_url=first_question_audio_url,
        resume_text=resume_text,
        jd_text=jd_final,
        candidate_name=request.candidate_name,
        position=request.position
    )


async def process_text_answer(request: ProcessTextAnswerRequest) -> ProcessAnswerResponse:
    
    # Get session data
    if request.session_id not in active_sessions:
        raise ValueError(f"Session {request.session_id} not found")
    
    session_data = active_sessions[request.session_id]
    
    # Store answer
    response_record = QuestionResponse(
        question_index=request.current_question_index,
        question=session_data.questions[request.current_question_index].question,
        answer=request.answer_text,
        timestamp=get_indian_time().isoformat()
    )
    session_data.responses.append(response_record)
    
    # Generate follow-up question if appropriate
    followup_generated = False
    if len(request.answer_text.split()) >= 10 and len(session_data.questions) < 5:
        followup = await generate_followup_question(
            session_data.questions[request.current_question_index].question,
            request.answer_text,
            session_data.jd_text
        )
        if followup:
            followup_question = InterviewQuestion(
                type="followup",
                question=followup,
                focus_area=session_data.questions[request.current_question_index].focus_area
            )
            session_data.questions.insert(request.current_question_index + 1, followup_question)
            followup_generated = True
    
    # Move to next question
    next_index = request.current_question_index + 1
    
    # Check if interview is complete
    if next_index >= len(session_data.questions):
        return ProcessAnswerResponse(
            status="completed",
            followup_generated=followup_generated,
            total_questions=len(session_data.questions)
        )
    
    # Generate audio for next question (returns signed URL)
    next_question_audio_url = await text_to_speech(
        session_data.questions[next_index].question,
        session_data.session_id,
        next_index
    )
    
    return ProcessAnswerResponse(
        status="in_progress",
        next_question=session_data.questions[next_index].question,
        next_question_audio_url=next_question_audio_url,
        next_question_index=next_index,
        followup_generated=followup_generated,
        total_questions=len(session_data.questions),
        question_type=session_data.questions[next_index].type
    )


async def process_voice_answer(request: ProcessVoiceAnswerRequest) -> ProcessAnswerResponse:
    
    # Get signed URL for audio
    audio_signed_url = storage_client.get_url(request.audio_blob_name, expiration=1)
    if not audio_signed_url:
        raise ValueError(f"Audio file not found: {request.audio_blob_name}")
    
    # Convert speech to text
    transcription = await speech_to_text(audio_signed_url)
    
    # Process as text answer
    text_request = ProcessTextAnswerRequest(
        session_id=request.session_id,
        answer_text=transcription,
        current_question_index=request.current_question_index
    )
    
    result = await process_text_answer(text_request)
    result.transcription = transcription
    
    return result


async def generate_final_report(request: GenerateReportRequest) -> GenerateReportResponse:
    
    # Get session data
    if request.session_id not in active_sessions:
        raise ValueError(f"Session {request.session_id} not found")
    
    session_data = active_sessions[request.session_id]
    
    # Generate report
    report = await generate_interview_report(
        jd=session_data.jd_text,
        resume=session_data.resume_text,
        questions=session_data.questions,
        responses=session_data.responses,
        candidate_name=session_data.candidate_name or "Unknown",
        position=session_data.position or "Unknown Position",
        session_id=session_data.session_id
    )
    
    # Generate markdown report
    markdown_report = generate_markdown_report(report)
    
    # Upload markdown to GCP Storage
    markdown_signed_url = upload_markdown_report(markdown_report, session_data.session_id)
    
    return GenerateReportResponse(
        report=report,
        markdown_report=markdown_report,
        markdown_url=markdown_signed_url
    )
