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
from src.genai.hr_interview.question_generator import generate_next_question, should_continue_interview
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
    
    # JD is now directly provided as markdown text
    jd_text = request.jd_text
    
    # Use session_id from request (provided by backend)
    session_id = request.session_id
    
    # Create session data (with empty questions list initially)
    session_data = SessionData(
        session_id=session_id,
        resume_text=resume_text,
        jd_text=jd_text,
        candidate_name=request.candidate_name,
        position=request.position,
        responses=[],
        questions_asked=[],
        current_question_index=0
    )
    
    # Store session
    active_sessions[session_id] = session_data
    
    # Generate first question
    first_question = await generate_next_question(
        jd=jd_text,
        resume=resume_text,
        previous_qa=[],
        candidate_name=request.candidate_name
    )
    
    # Add to questions asked
    session_data.questions_asked.append(first_question)
    
    # Generate audio for first question (returns signed URL)
    first_question_audio_url = await text_to_speech(
        first_question.question,
        session_id,
        0
    )
    
    return StartInterviewResponse(
        session_id=session_id,
        first_question=first_question,
        first_question_audio_url=first_question_audio_url,
        resume_text=resume_text,
        jd_text=jd_text,
        candidate_name=request.candidate_name,
        position=request.position,
        question_index=0
    )


async def process_text_answer(request: ProcessTextAnswerRequest) -> ProcessAnswerResponse: 
    # Get session data
    if request.session_id not in active_sessions:
        raise ValueError(f"Session {request.session_id} not found")
    
    session_data = active_sessions[request.session_id]
    
    # Get current question
    current_question = session_data.questions_asked[session_data.current_question_index]
    
    # Store answer
    response_record = QuestionResponse(
        question_index=session_data.current_question_index,
        question=current_question.question,
        answer=request.answer_text,
        timestamp=get_indian_time().isoformat()
    )
    session_data.responses.append(response_record)
    
    # Move to next question index
    session_data.current_question_index += 1
    
    # Check if interview should continue
    should_continue = await should_continue_interview(
        session_data.responses,
        min_questions=5,
        max_questions=10,
        max_poor_answers=3
    )
    
    # Import count_poor_answers to get the count
    from src.genai.hr_interview.question_generator import count_poor_answers
    poor_count = count_poor_answers(session_data.responses)
    
    if not should_continue:
        # Determine completion reason
        question_count = len(session_data.questions_asked)
        
        if poor_count >= 3:
            completion_reason = "poor_answers"
        elif question_count >= 10:
            completion_reason = "max_questions"
        else:
            completion_reason = "min_questions_reached"
        
        return ProcessAnswerResponse(
            status="completed",
            total_questions_asked=len(session_data.questions_asked),
            completion_reason=completion_reason,
            poor_answer_count=poor_count
        )
    
    # Generate next question based on conversation history
    next_question = await generate_next_question(
        jd=session_data.jd_text,
        resume=session_data.resume_text,
        previous_qa=session_data.responses,
        candidate_name=session_data.candidate_name
    )
    
    # Add to questions asked
    session_data.questions_asked.append(next_question)
    
    # Generate audio for next question (returns signed URL)
    next_question_audio_url = await text_to_speech(
        next_question.question,
        session_data.session_id,
        session_data.current_question_index
    )
    
    return ProcessAnswerResponse(
        status="in_progress",
        next_question=next_question,
        next_question_audio_url=next_question_audio_url,
        next_question_index=session_data.current_question_index,
        total_questions_asked=len(session_data.questions_asked),
        poor_answer_count=poor_count
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
        answer_text=transcription
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
        questions=session_data.questions_asked,
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