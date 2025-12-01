from typing import Dict, List
from src.utils.datetime import get_indian_time
from src.core.logger import logger

from src.genai.schemas.hr_interview import (
    StartInterviewRequest,
    StartInterviewResponse,
    ProcessTextAnswerRequest,
    ProcessAnswerResponse,
    GenerateReportRequest,
    GenerateReportResponse,
    SessionData,
    QuestionResponse,
    InterviewQuestion
)

from src.genai.hr_interview.pdf_processor import extract_text_from_pdf
from src.genai.hr_interview.question_generator import generate_next_question, should_continue_interview, is_clarifying_question, generate_clarification, count_poor_answers
from src.genai.hr_interview.report_generator import generate_interview_report
from src.genai.hr_interview.tts_engine import text_to_speech
from src.genai.hr_interview.stt_engine import speech_to_text
from src.core.storage import storage_client

from src.core.redis import redis_client

async def save_session_to_redis(session_data: SessionData) -> None:
    session_dict = session_data.model_dump(mode='json')
    await redis_client.set_session(session_data.session_id, session_dict)


async def get_session_from_redis(session_id: str) -> SessionData:
    session_dict = await redis_client.get_session(session_id)
    if not session_dict:
        raise ValueError(f"Session {session_id} not found")
    return SessionData(**session_dict)


async def update_session_in_redis(session_data: SessionData) -> None:
    session_dict = session_data.model_dump(mode='json')
    await redis_client.update_session(session_data.session_id, session_dict)


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


async def start_interview(request: StartInterviewRequest) -> StartInterviewResponse:
    resume_signed_url = storage_client.get_url(request.resume_blob_name, expiration=1)
    if not resume_signed_url:
        raise ValueError(f"Resume not found: {request.resume_blob_name}")
    
    resume_text = await extract_text_from_pdf(resume_signed_url)
    
    # JD markdown text
    jd_text = request.jd_text
    
    session_id = request.session_id
    
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
    
    await save_session_to_redis(session_data)
    
    # Create welcoming first question
    candidate_name = request.candidate_name or "candidate"
    welcoming_question_text = f"""Good day, {candidate_name}. I hope you're doing well. I'd like to welcome you to the Workzone Interview. The purpose of this session is to help you evaluate your readiness and communication for real-world interviews. To begin, could you please introduce yourself and share a little overview of your background?"""
    
    first_question = InterviewQuestion(
        type="introduction",
        question=welcoming_question_text,
        focus_area="general"
    )
    
    session_data.questions_asked.append(first_question)
    
    await update_session_in_redis(session_data)
    
    first_question_audio_url = await text_to_speech(
        first_question.question,
        session_id,
        0
    )
    
    return StartInterviewResponse(
        session_id=session_id,
        question_text=first_question,
        question_audio_url=first_question_audio_url,
        question_index=0
    )


async def process_text_answer(request: ProcessTextAnswerRequest) -> ProcessAnswerResponse:
    session_data = await get_session_from_redis(request.session_id)
    
    # Get current question
    current_question = session_data.questions_asked[session_data.current_question_index]
    
    if await is_clarifying_question(request.answer_text, current_question.question):
        clarification_text = await generate_clarification(current_question.question, request.answer_text)
        
        clarification_audio_url = await text_to_speech(
            clarification_text,
            session_data.session_id,
            session_data.current_question_index  # Keep same index
        )
        
        poor_count = await count_poor_answers(session_data.responses)
        
        return ProcessAnswerResponse(
            status="clarification_needed",
            question_text=current_question,
            question_audio_url=clarification_audio_url,
            question_index=session_data.current_question_index,
            total_questions_asked=len(session_data.questions_asked),
            poor_answer_count=poor_count,
            clarification=clarification_text
        )
    
    
    response_record = QuestionResponse(
        question_index=session_data.current_question_index,
        question=current_question.question,
        answer=request.answer_text,
        timestamp=get_indian_time().isoformat()
    )
    session_data.responses.append(response_record)
    
    # Move to next question index
    session_data.current_question_index += 1
    
    await update_session_in_redis(session_data)
    
    # Check if interview should continue
    should_continue = await should_continue_interview(
        session_data.responses,
        min_questions=5,
        max_questions=10,
        max_poor_answers=3
    )
    
    # Get poor answer count
    poor_count = await count_poor_answers(session_data.responses)
    
    if not should_continue:
        question_count = len(session_data.questions_asked)
        
        if poor_count >= 3:
            completion_reason = "poor_answers"
        elif question_count >= 10:
            completion_reason = "max_questions"
        else:
            completion_reason = "min_questions_reached"
        
        candidate_name = session_data.candidate_name or "candidate"
        closing_message = f"""Thank you, {candidate_name}, for your time and thoughtful responses. This concludes your Workzone interview session. You'll soon receive feedback highlighting your strengths and areas for improvement. We appreciate your participation and wish you continued success in your career journey. Have a great day and best of luck with your future interviews."""
        
        closing_audio_url = await text_to_speech(
            closing_message,
            session_data.session_id,
            session_data.current_question_index
        )
        
        return ProcessAnswerResponse(
            status="completed",
            total_questions_asked=len(session_data.questions_asked),
            completion_reason=completion_reason,
            poor_answer_count=poor_count,
            clarification=closing_message,
            question_audio_url=closing_audio_url
        )
    
    # ELse continue and generate next question
    next_question = await generate_next_question(
        jd=session_data.jd_text,
        resume=session_data.resume_text,
        previous_qa=session_data.responses,
        candidate_name=session_data.candidate_name
    )
    
    # Add to questions asked
    session_data.questions_asked.append(next_question)
    
   
    await update_session_in_redis(session_data)
    
    next_question_audio_url = await text_to_speech(
        next_question.question,
        session_data.session_id,
        session_data.current_question_index
    )
    
    return ProcessAnswerResponse(
        status="in_progress",
        question_text=next_question,
        question_audio_url=next_question_audio_url,
        question_index=session_data.current_question_index,
        total_questions_asked=len(session_data.questions_asked),
        poor_answer_count=poor_count
    )


async def process_voice_answer(session_id: str, audio_data: bytes) -> ProcessAnswerResponse: 
    transcription = await speech_to_text(audio_data)
    logger.info(transcription)
    
    text_request = ProcessTextAnswerRequest(
        session_id=session_id,
        answer_text=transcription
    )
    
    result = await process_text_answer(text_request)
    result.transcription = transcription
    
    return result


async def generate_final_report(request: GenerateReportRequest) -> GenerateReportResponse:
    session_data = await get_session_from_redis(request.session_id)
    
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
    
    # Return response without uploading to GCP
    return GenerateReportResponse(
        report=report,
        markdown_report=markdown_report,
        markdown_url=""  # Empty string since we're not uploading
    )