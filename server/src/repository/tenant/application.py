from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Application, ApplicationStatus
from sqlalchemy import select
from src.core.logger import logger

class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_application_by_id(self, id: str, options: list | None = None) -> Application | None:
        query = select(Application).where(Application.id == id)
        if options:
            query = query.options(*options)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def apply_job(self, job_id: str, user_id: str, resume: str) -> Application:
        try:
            new_application = Application(
                job_id=job_id,
                user_id=user_id,
                resume=resume
            )
            self.db.add(new_application)
            await self.db.commit()
            await self.db.refresh(new_application)
            return new_application
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Unexpected error applying job: {e}")
            raise
    
    async def get_applications_by_job_id(self, job_id: str) -> list[Application]:
        try:
            result = await self.db.execute(select(Application).where(Application.job_id==job_id))
            return result.scalars().all()
        except Exception as e:
            logger.exception(f"Error fetching applications: {e}")
            raise

    async def get_application_by_user_job_id(self, user_id: str, job_id: str):
        try:
            result = await self.db.execute(select(Application).where(Application.job_id==job_id, Application.user_id==user_id))
            return result.scalar_one_or_none()
        except Exception as e:
            logger.exception(f"Error fetching applications: {e}")
            raise

    async def get_applications_by_user_id(self, user_id: str) -> list[Application]:
        try:
            result = await self.db.execute(select(Application).where(Application.user_id==user_id))
            return result.scalars().all()
        except Exception as e:
            logger.exception(f"Error fetching applications: {e}")
            raise

    async def withdraw_application(self, id: str) -> Application | None:
        try:
            result = await self.db.execute(select(Application).where(Application.id==id))
            application = result.scalar_one_or_none()
            
            if not application:
                return None
            
            application.status = ApplicationStatus.WITHDRAWN
            await self.db.commit()
            await self.db.refresh(application)
            return application
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Error withdrawing application: {e}")
            raise

