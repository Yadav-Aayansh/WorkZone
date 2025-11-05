"""
WebSocket-based AI Interview Service
Handles real-time interview communication via WebSocket
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import WebSocket, WebSocketDisconnect

from src.utils.datetime import get_indian_time
from src.genai.schemas.hr_interview_schemas import (
    InterviewQuestion,
    QuestionResponse,
    SessionData
)
from src.genai.schemas.ai_interview_ws_schemas import (
    WSQuestionMessage,
    WSStatusMessage,
    WSErrorMessage,
    WSCompletionMessage,
    WSTranscriptionMessage,
    WSTextAnswerMessage,
    WSAudioAnswerMessage
)
from src.genai.hr_interview.pdf_processor import extract_text_from_pdf
from src.genai.hr_interview.question_generator import generate_interview_questions, generate_followup_question
from src.genai.hr_interview.tts_engine import text_to_speech
from src.genai.hr_interview.stt_engine import speech_to_text
from src.genai.hr_interview.report_generator import generate_interview_report
from src.genai.hr_interview.pdf_report_generator import generate_and_upload_pdf_report
from src.core.storage import storage_client


# In-memory session storage (replace with Redis in production)
active_ws_sessions: Dict[str, SessionData] = {}
active_connections: Dict[str, WebSocket] = {}

# Session timeout: 30 minutes
SESSION_TIMEOUT = timedelta(minutes=30)


async def initialize_interview_session(
    session_id: str,
    resume_blob_name: str,
    jd_content: str,
    candidate_name: Optional[str],
    position: Optional[str],
    num_questions: int = 3
) -> SessionData:
    """
    Initialize an interview session with resume and JD processing
    """
    # Get signed URL for resume and extract text
    resume_signed_url = storage_client.get_url(resume_blob_name, expiration=1)
    if not resume_signed_url:
        raise ValueError(f"Resume not found: {resume_blob_name}")
    
    resume_text = extract_text_from_pdf(resume_signed_url)
    
    # Generate interview questions using Gemini 2.5 Pro (via llm_client)
    questions = generate_interview_questions(jd_content, resume_text, num_questions)
    
    # Create session data
    session_data = SessionData(
        session_id=session_id,
        questions=questions,
        resume_text=resume_text,
        jd_text=jd_content,
        candidate_name=candidate_name,
        position=position,
        responses=[]
    )
    
    # Store session
    active_ws_sessions[session_id] = session_data
    
    return session_data


async def send_question(
    websocket: WebSocket,
    session_data: SessionData,
    question_index: int
):
    """
    Send a question to the client via WebSocket
    """
    question = session_data.questions[question_index]
    
    # Generate audio for the question (returns signed URL)
    question_audio_url = text_to_speech(
        question.question,
        session_data.session_id,
        question_index
    )
    
    # Create and send question message
    message = WSQuestionMessage(
        type="question",
        question_index=question_index,
        question_text=question.question,
        question_audio_url=question_audio_url,
        total_questions=len(session_data.questions),
        question_type=question.type,
        timestamp=get_indian_time().isoformat()
    )
    
    await websocket.send_json(message.model_dump())


async def process_text_answer(
    websocket: WebSocket,
    session_data: SessionData,
    answer_text: str,
    question_index: int
) -> bool:
    """
    Process a text answer from the candidate
    Returns True if interview continues, False if completed
    """
    # Store answer
    response_record = QuestionResponse(
        question_index=question_index,
        question=session_data.questions[question_index].question,
        answer=answer_text,
        timestamp=get_indian_time().isoformat()
    )
    session_data.responses.append(response_record)
    
    # Generate follow-up question if appropriate
    if len(answer_text.split()) >= 10 and len(session_data.questions) < 10:
        followup = generate_followup_question(
            session_data.questions[question_index].question,
            answer_text,
            session_data.jd_text
        )
        if followup:
            followup_question = InterviewQuestion(
                type="followup",
                question=followup,
                focus_area=session_data.questions[question_index].focus_area
            )
            session_data.questions.insert(question_index + 1, followup_question)
            
            # Send status update
            status_msg = WSStatusMessage(
                type="status",
                status="Follow-up question generated",
                details={"followup_generated": True},
                timestamp=get_indian_time().isoformat()
            )
            await websocket.send_json(status_msg.model_dump())
    
    # Move to next question
    next_index = question_index + 1
    
    # Check if interview is complete
    if next_index >= len(session_data.questions):
        return False  # Interview completed
    
    # Send next question
    await send_question(websocket, session_data, next_index)
    return True  # Interview continues


async def process_audio_answer(
    websocket: WebSocket,
    session_data: SessionData,
    audio_blob_name: str,
    question_index: int
) -> bool:
    """
    Process an audio answer from the candidate
    Returns True if interview continues, False if completed
    """
    # Get signed URL for audio
    audio_signed_url = storage_client.get_url(audio_blob_name, expiration=1)
    if not audio_signed_url:
        raise ValueError(f"Audio file not found: {audio_blob_name}")
    
    # Convert speech to text using Gemini 2.5 Flash (via stt_engine)
    transcription = speech_to_text(audio_signed_url)
    
    # Send transcription back to client
    transcription_msg = WSTranscriptionMessage(
        type="transcription",
        transcription=transcription,
        timestamp=get_indian_time().isoformat()
    )
    await websocket.send_json(transcription_msg.model_dump())
    
    # Process as text answer
    return await process_text_answer(websocket, session_data, transcription, question_index)


async def complete_interview(
    websocket: WebSocket,
    session_data: SessionData
):
    """
    Complete the interview and generate report
    """
    # Generate report
    report = generate_interview_report(
        jd=session_data.jd_text,
        resume=session_data.resume_text,
        questions=session_data.questions,
        responses=session_data.responses,
        candidate_name=session_data.candidate_name or "Unknown",
        position=session_data.position or "Unknown Position",
        session_id=session_data.session_id
    )
    
    # Generate and upload PDF
    pdf_signed_url = generate_and_upload_pdf_report(report)
    
    # Send completion message
    completion_msg = WSCompletionMessage(
        type="completion",
        message="Interview completed successfully",
        report_url=pdf_signed_url,
        overall_score=report.overall_score,
        timestamp=get_indian_time().isoformat()
    )
    await websocket.send_json(completion_msg.model_dump())


async def handle_websocket_session(
    websocket: WebSocket,
    session_id: str
):
    """
    Main WebSocket handler for an interview session
    """
    await websocket.accept()
    
    # Get session data
    if session_id not in active_ws_sessions:
        error_msg = WSErrorMessage(
            type="error",
            error="Session not found",
            code="SESSION_NOT_FOUND",
            timestamp=get_indian_time().isoformat()
        )
        await websocket.send_json(error_msg.model_dump())
        await websocket.close()
        return
    
    session_data = active_ws_sessions[session_id]
    active_connections[session_id] = websocket
    
    try:
        # Send initial status
        status_msg = WSStatusMessage(
            type="status",
            status="Connected to interview session",
            details={"session_id": session_id},
            timestamp=get_indian_time().isoformat()
        )
        await websocket.send_json(status_msg.model_dump())
        
        # Send first question
        await send_question(websocket, session_data, 0)
        
        # Set timeout
        start_time = datetime.now()
        
        # Listen for messages
        while True:
            # Check timeout (30 minutes)
            if datetime.now() - start_time > SESSION_TIMEOUT:
                timeout_msg = WSStatusMessage(
                    type="status",
                    status="Interview timeout - 30 minutes exceeded",
                    details={"timeout": True},
                    timestamp=get_indian_time().isoformat()
                )
                await websocket.send_json(timeout_msg.model_dump())
                await complete_interview(websocket, session_data)
                break
            
            # Wait for message with timeout
            try:
                message_data = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=60.0  # 60 second timeout for receiving messages
                )
            except asyncio.TimeoutError:
                # No message received, continue waiting
                continue
            
            message_type = message_data.get("type")
            
            if message_type == "text_answer":
                msg = WSTextAnswerMessage(**message_data)
                continues = await process_text_answer(
                    websocket,
                    session_data,
                    msg.answer,
                    msg.question_index
                )
                if not continues:
                    await complete_interview(websocket, session_data)
                    break
            
            elif message_type == "audio_answer":
                msg = WSAudioAnswerMessage(**message_data)
                continues = await process_audio_answer(
                    websocket,
                    session_data,
                    msg.audio_blob_name,
                    msg.question_index
                )
                if not continues:
                    await complete_interview(websocket, session_data)
                    break
            
            else:
                error_msg = WSErrorMessage(
                    type="error",
                    error=f"Unknown message type: {message_type}",
                    code="INVALID_MESSAGE_TYPE",
                    timestamp=get_indian_time().isoformat()
                )
                await websocket.send_json(error_msg.model_dump())
    
    except WebSocketDisconnect:
        # Client disconnected
        pass
    
    except Exception as e:
        # Send error message
        error_msg = WSErrorMessage(
            type="error",
            error=str(e),
            code="INTERNAL_ERROR",
            timestamp=get_indian_time().isoformat()
        )
        try:
            await websocket.send_json(error_msg.model_dump())
        except:
            pass
    
    finally:
        # Clean up
        if session_id in active_connections:
            del active_connections[session_id]
        # Keep session data for report retrieval
