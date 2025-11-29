from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.di import get_tenant_db
from src.models.tenant import AiInterview
from src.genai.hr_interview.main import start_interview, process_text_answer, process_voice_answer, generate_final_report
from src.core.logger import logger

ai_interview_router = APIRouter(tags=["Tenant AI Interview"])

@ai_interview_router.post("/ai-interview")
async def create_session(
    application_id: str,
    job_id: str,
    db: AsyncSession = Depends(get_tenant_db)
):
    new_ai = AiInterview(application_id=application_id, job_id=job_id)
    db.add(new_ai)
    await db.commit()
    await db.refresh(new_ai)
    return new_ai


@ai_interview_router.websocket("/ws/{interview_id}")
async def interview(websocket: WebSocket, interview_id: str):
    await websocket.accept()  # REQUIRED
    
    try:
        from src.genai.schemas import StartInterviewRequest, ProcessTextAnswerRequest, GenerateReportRequest
        
        start_res = await start_interview(
            StartInterviewRequest(
                session_id=interview_id,
                resume_blob_name="resumes/resume.pdf",
                jd_text="""
# Backend Developer (2+ Years Experience)

## About the Role
We’re looking for a **Backend Developer** with at least 2 years of hands-on experience in building and maintaining scalable APIs, microservices, and backend systems. You’ll work closely with the product and frontend teams to architect and deliver high-performance, reliable, and secure backend solutions.

## Responsibilities
- Design, develop, and maintain RESTful or GraphQL APIs  
- Write clean, efficient, and maintainable code following best practices  
- Integrate databases, caching systems, and third-party APIs  
- Optimize performance and scalability of backend systems  
- Implement authentication, authorization, and secure data handling  
- Participate in code reviews, system design discussions, and deployment planning  
- Collaborate with DevOps for CI/CD and cloud deployments  

## Required Skills
- **Languages:** Python, Go, or Node.js (Python preferred)  
- **Frameworks:** FastAPI, Flask, or Express.js  
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis  
- **APIs:** RESTful, GraphQL  
- **DevOps/Tools:** Docker, Git, CI/CD pipelines (GitHub Actions, Jenkins, etc.)  
- **Cloud:** AWS, GCP, or Azure basics  
- **Testing:** Pytest, Postman, or similar tools  

## Nice-to-Have
- Experience with microservices or event-driven architecture  
- Knowledge of message brokers (RabbitMQ, Kafka)  
- Familiarity with container orchestration (Kubernetes)  
- Understanding of async programming and performance tuning  

## Qualifications
- 2+ years of backend development experience  
- Bachelor’s degree in Computer Science, Engineering, or related field (or equivalent practical experience)  

## What We Offer
- Competitive salary and flexible work options  
- Collaborative and fast-moving work environment  
- Opportunities for learning, mentorship, and growth  

""",
                candidate_name="Test User",
                position="Backend Dev"
            )
        )

        await websocket.send_json(start_res.model_dump())
        logger.info(f"Started interview: {interview_id}")
        
        # Simple echo test
        while True:
            message = await websocket.receive()
            if "text" in message:
                request = ProcessTextAnswerRequest(session_id=interview_id, answer_text=message["text"])
                llm_reply = await process_text_answer(request=request)
            
            elif "bytes" in message:
                logger.info(type(message["bytes"]))
                llm_reply = await process_voice_answer(session_id=interview_id, audio_data=message["bytes"])
            
            else:
                logger.warning(f"Unknown message type: {message}")
                continue

            # if llm_reply.status == "in_progress":
            if llm_reply.status in ["in_progress", "clarification_needed"]:
                await websocket.send_json(llm_reply.model_dump())
            else:
                report = await generate_final_report(GenerateReportRequest(session_id=interview_id))
                await websocket.send_text(report.markdown_report)
                await websocket.close(code=1000, reason="Interview completed")
                break
            
    except Exception as e:
        logger.error(f"Error: {e}")
        raise