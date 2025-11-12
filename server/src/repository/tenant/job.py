from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Job
from src.core.logger import logger
from sqlalchemy import select, exists, or_
from sqlalchemy.orm import joinedload
from typing import Optional

class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_job_by_id(self, id: str, with_applications: bool = False) -> Job | None:
        query = await select(Job).where(Job.id == id)
        if with_applications:
            query = query.options(joinedload(Job.applications))
        result = self.db.execute(query)
        return result.scalar_one_or_none()

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
            await self.db.rollback()
            logger.exception(f"Unexpected error creating job: {e}")
            raise


    async def list_jobs(self, department: Optional[str], location: Optional[str], is_open: Optional[bool], search: Optional[str]):
        try:
            query = select(Job)
        
            if department:
                query = query.where(Job.department == department)
            if location:
                query = query.where(Job.location == location)
            if is_open is not None:
                query = query.where(Job.is_open == is_open)
            if search:
                query = query.where(
                    or_(
                        Job.title.ilike(f"%{search}%"),
                        Job.description.ilike(f"%{search}%")
                    )
                )
            
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.exception(f"Error listing jobs: {e}")
            raise

        
    async def update_job(self, id: str, data: dict):
        try:
            result = await self.db.execute(select(Job).where(Job.id==id))
            job = result.scalar_one_or_none()
            
            if not job:
                return None
            
            for key, value in data.items():
                setattr(job, key, value)
            
            await self.db.commit()
            await self.db.refresh(job)
            return job
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Error updating job: {e}")
            raise

    async def delete_job(self, id: str):
        try:
            result = await self.db.execute(select(Job).where(Job.id==id))
            job = result.scalar_one_or_none()
            
            if not job:
                return False
            
            await self.db.delete(job)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.exception(f"Error deleting job: {e}")
            raise
    

    

