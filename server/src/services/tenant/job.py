from src.repository.tenant import JobRepository
from src.schemas.tenant import CreateJobRequest
from src.core.context import user_context
from src.core.logger import logger

class JobService:
    def __init__(self, job_repo: JobRepository):
        self.job_repo = job_repo

    async def create_job(self, data: CreateJobRequest, user_id: str):
        try:
            job = await self.job_repo.create_job(
                title=data.title,
                description=data.description,
                department=data.department,
                location=data.location,
                posted_by=user_id
            )
            return job
        except Exception as e:
            logger.exception(e)
            raise



    