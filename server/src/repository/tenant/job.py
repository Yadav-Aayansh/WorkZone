from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Job
from src.core.logger import logger

class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_job(self, title: str, description: str, department: str, location: str, posted_by: str):
        try: 
            new_job = Job(
            title=title,
            description=description,
            department=department,
            location=location,
            posted_by=posted_by
        )

            self.db.add(new_job)
            await self.db.commit()
            await self.db.refresh(new_job)
            return new_job
        except Exception as e:
            self.db.rollback()
            logger.exception(f"Unexpected error creating job: {e}")
            raise
        
    

    

