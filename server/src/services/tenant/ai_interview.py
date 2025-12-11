import asyncio
from uuid import UUID
from src.repository.tenant import AiInterviewRepository, ApplicationRepository
from src.exceptions.tenant import (
    AiInterviewAlreadyExistsError, AiInterviewNotFoundError, ApplicationNotFoundError,
    ApplicationNotShortlistedError
)
from fastapi import WebSocket
from src.genai.schemas import StartInterviewRequest, ProcessTextAnswerRequest, GenerateReportRequest
from src.genai.hr_interview.main import start_interview, process_text_answer, process_voice_answer, generate_final_report
from src.core.logger import logger
from src.utils.datetime import get_indian_time
from src.models.tenant import Application, ApplicationStatus
from sqlalchemy.orm import selectinload

class AiInterviewService:
    def __init__(self, ai_interview_repo: AiInterviewRepository, application_repo: ApplicationRepository):
        self.ai_interview_repo = ai_interview_repo
        self.application_repo = application_repo

    async def register_ai_interview(self, application_id: UUID):
        application = await self.application_repo.get_application_by_id(application_id)
        if not application:
            raise ApplicationNotFoundError("Application does not exist!")
        
        if application.status != ApplicationStatus.SHORTLISTED:
            raise ApplicationNotShortlistedError("You are not shortlisted!")

        ai_interview = await self.ai_interview_repo.is_application_id_exist(application_id)
        if ai_interview:
            raise AiInterviewAlreadyExistsError("An AI interview has already been created for this application.") 
        
        return await self.ai_interview_repo.create_ai_interview(application_id)
    

    async def handle_interview_session(self, websocket: WebSocket, id: UUID):
        await websocket.send_json({
            "type": "status",
            "message": "Connecting to interview session..."
        })
        
        ai_interview = await self.ai_interview_repo.get_ai_interview_by_id(id)
        if not ai_interview:
            raise AiInterviewNotFoundError("Ai Interview not found!")
        
        await websocket.send_json({
            "type": "status",
            "message": "Loading application details..."
        })
        
        application = await self.application_repo.get_application_by_id(
            id=ai_interview.application_id,
            options=[selectinload(Application.user), selectinload(Application.job)]
        )

        await websocket.send_json({
            "type": "status",
            "message": "Preparing your first question..."
        })
        
        init_request = StartInterviewRequest(
            session_id=str(id),
            resume_blob_name=application.resume,
            jd_text=application.job.description,
            candidate_name=application.user.name,
            position=application.job.title
        )

        init_response = await start_interview(init_request)

        await websocket.send_json({
            "type": "question",
            **init_response.model_dump()
        })

        while True:
            message = await websocket.receive()
            if "text" in message:
                text_request = ProcessTextAnswerRequest(session_id=str(id), answer_text=message["text"])
                next_response = await process_text_answer(request=text_request)
            
            elif "bytes" in message:
                logger.info(type(message["bytes"]))
                next_response = await process_voice_answer(session_id=str(id), audio_data=message["bytes"])
            
            else:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid message format"
                })
                continue

            if next_response.status == "completed":
                await websocket.send_json({
                    "type": "status",
                    "message": "Generating your interview report..."
                })

                async def generate_with_progress():
                    return await generate_final_report(GenerateReportRequest(session_id=str(id)))
                
                async def send_progress():
                    messages = [
                        "Analyzing your responses...",
                        "Evaluating technical skills...",
                        "Assessing communication quality...",
                        "Preparing detailed feedback...",
                        "Finalizing your report..."
                    ]
                    for msg in messages:
                        try:
                            await websocket.send_json({"type": "status", "message": msg})
                        except:
                            break
                        await asyncio.sleep(15)  # Sleep AFTER sending
                
                progress_task = asyncio.create_task(send_progress())
                try:
                    report = await generate_with_progress()
                finally:
                    progress_task.cancel()
                    try:
                        await progress_task
                    except asyncio.CancelledError:
                        pass

                await websocket.send_json({
                    "type": "report",
                    "report": report.markdown_report
                })
                await self.ai_interview_repo.update_ai_interview(id, report=report.markdown_report, completed_at=get_indian_time())
                await self.application_repo.update_application_status(ai_interview.application_id, ApplicationStatus.AI_INTERVIEW_COMPLETED)
                await websocket.close(code=1000, reason="Interview completed")
                break
            else:
                await websocket.send_json({
                    "type": "question",
                    **next_response.model_dump()
                })
