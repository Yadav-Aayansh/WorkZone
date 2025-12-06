from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import AiInterview
from sqlalchemy import select, exists
from src.core.logger import logger

class AiInterviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def is_application_id_exist(self, application_id: UUID) -> bool:
        result = await self.db.execute(select(exists().where(AiInterview.application_id==application_id)))
        return result.scalar()
    
    async def get_ai_interview_by_id(self, id: UUID) -> AiInterview:
        result = await self.db.execute(select(AiInterview).where(AiInterview.id==id))
        return result.scalar_one_or_none()

    async def create_ai_interview(self, application_id: UUID) -> AiInterview:
        try:
            new_ai_interview = AiInterview(
                application_id=application_id
            )
            self.db.add(new_ai_interview)
            await self.db.commit()
            await self.db.refresh(new_ai_interview)
            return new_ai_interview
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Error creating ai interview: {e}")
            raise
    
    async def update_ai_interview(self, id: UUID, data: dict):
        try:
            ai_interview = await self.get_ai_interview_by_id(id)
            if not ai_interview:
                return None
            
            for key, value in data.items():
                setattr(ai_interview, key, value)
            
            await self.db.commit()
            await self.db.refresh(ai_interview)
            return ai_interview
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Error updating ai interview: {e}")
            raise

