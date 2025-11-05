"""
AI Interview WebSocket Routes
Provides REST endpoint for initialization and WebSocket endpoint for real-time interview
"""

from fastapi import APIRouter, WebSocket, HTTPException, Depends
from typing import Optional
import uuid

from src.genai.schemas.ai_interview_ws_schemas import (
    InitInterviewRequest,
    InitInterviewResponse
)
from src.genai.hr_interview.websocket_service import (
    initialize_interview_session,
    handle_websocket_session
)
from src.utils.datetime import get_indian_time


ai_interview_router = APIRouter(
    prefix="/ai-interview",
    tags=["AI Interview"]
)


@ai_interview_router.post("/init", response_model=InitInterviewResponse)
async def init_interview(request: InitInterviewRequest):
    """
    Initialize an AI interview session
    
    Flow:
    1. Client calls this endpoint with application details
    2. Backend generates interview_id and processes resume/JD
    3. Backend generates initial questions
    4. Client receives interview_id and websocket_url
    5. Client connects to WebSocket using interview_id
    """
    try:
        # Generate unique session ID
        timestamp = get_indian_time().strftime('%Y%m%d_%H%M%S')
        candidate_slug = request.candidate_name.replace(' ', '_') if request.candidate_name else 'candidate'
        session_id = f"interview_{timestamp}_{candidate_slug}_{uuid.uuid4().hex[:8]}"
        
        # Initialize session (async processing of resume/JD, question generation)
        await initialize_interview_session(
            session_id=session_id,
            resume_blob_name=request.resume_blob_name,
            jd_content=request.jd_content,
            candidate_name=request.candidate_name,
            position=request.position,
            num_questions=request.num_questions
        )
        
        # Return session info
        return InitInterviewResponse(
            interview_id=session_id,
            websocket_url=f"/api/tenant/ai-interview/ws/{session_id}"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize interview: {str(e)}")


@ai_interview_router.websocket("/ws/{session_id}")
async def websocket_interview_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time AI interview
    
    Message Flow:
    1. Client connects to this WebSocket
    2. Server sends first question (text + audio URL)
    3. Client sends answer (text or audio blob name)
    4. Server processes answer, sends next question or completion
    5. Loop continues until interview completes or timeout (30 min)
    
    Client -> Server Messages:
    - {"type": "text_answer", "answer": "...", "question_index": 0}
    - {"type": "audio_answer", "audio_blob_name": "...", "question_index": 0}
    
    Server -> Client Messages:
    - {"type": "status", "status": "...", "details": {...}}
    - {"type": "question", "question_text": "...", "question_audio_url": "...", ...}
    - {"type": "transcription", "transcription": "..."}
    - {"type": "completion", "message": "...", "report_url": "...", "overall_score": ...}
    - {"type": "error", "error": "...", "code": "..."}
    """
    await handle_websocket_session(websocket, session_id)
