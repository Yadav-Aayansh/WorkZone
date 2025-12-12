from fastapi import APIRouter, Depends, WebSocket, HTTPException, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.di import get_tenant_db, get_ai_interview_service, get_ai_interview_service_ws
from src.models.tenant import AiInterview
from src.genai.hr_interview.main import start_interview, process_text_answer, process_voice_answer, generate_final_report
from src.core.logger import logger
from uuid import UUID
from src.services.tenant import AiInterviewService
from src.exceptions.tenant import AiInterviewAlreadyExistsError, ApplicationNotFoundError, AiInterviewNotFoundError, ApplicationNotShortlistedError

ai_interview_router = APIRouter(prefix="/ai-interview", tags=["Tenant AI Interview"])


@ai_interview_router.post("")
async def create_session(
    application_id: UUID,
    service: AiInterviewService = Depends(get_ai_interview_service)
):
    try:
        return await service.register_ai_interview(application_id)
    except ApplicationNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except AiInterviewAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ApplicationNotShortlistedError as e:
        raise HTTPException(status_code=403, detail=str(e))


@ai_interview_router.websocket("/ws/{ai_interview_id}")
async def interview(
    websocket: WebSocket,
    ai_interview_id: UUID,
    service: AiInterviewService = Depends(get_ai_interview_service_ws)
):
    await websocket.accept()
    try:
        await service.handle_interview_session(websocket, ai_interview_id)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {ai_interview_id}")
    except AiInterviewNotFoundError as e:
        await websocket.close(code=1008, reason="Ai Interview not found")
    except Exception as e:
        logger.error(f"Error: {e}")
        await websocket.close(code=1011)