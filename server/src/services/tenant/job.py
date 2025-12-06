from src.repository.tenant import JobRepository
from src.schemas.tenant import CreateJobRequest, ListJobsRequest, UpdateJobRequest
from src.core.context import user_context, tenant_context
from src.core.logger import logger
from src.exceptions.tenant import JobNotFoundError
from src.exceptions.base import RoleNotAllowedError
from src.tasks import resume_ranking
from typing import Optional

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

    async def list_jobs(self, data: ListJobsRequest):
        jobs = await self.job_repo.list_jobs(
            data.department,
            data.location,
            data.is_open,
            data.search
        )
        return jobs
    
    async def get_job(self, id: str):
        job = await self.job_repo.get_job_by_id(id)
        if not job:
            raise JobNotFoundError(f"Job not found")
        
        return job
    
    async def update_job(self, id: str, user_id: str, data: UpdateJobRequest):
        job = await self.job_repo.get_job_by_id(id)
        if not job:
            raise JobNotFoundError(f"Job not found")
        
        if str(job.posted_by) != user_id:
            raise RoleNotAllowedError("Invalid role!")
        
        return await self.job_repo.update_job(id, data.model_dump(exclude_unset=True,exclude_none=True))
    
    async def close_job(self, id: str, user_id: str, top_x: Optional[int] = None):
        job = await self.job_repo.get_job_by_id(id)
        if not job:
            raise JobNotFoundError(f"Job not found")
        
        if str(job.posted_by) != user_id:
            raise RoleNotAllowedError("Invalid role!")
        
        job = await self.job_repo.close_job(id)
        
        tenant_id = tenant_context.get()
        if top_x is not None:
            resume_ranking.delay(tenant_id, id, top_x)
        else:
            resume_ranking.delay(tenant_id, id)

        return job



    async def delete_job(self, id: str, user_id: str):
        job = await self.job_repo.get_job_by_id(id)
        if not job:
            raise JobNotFoundError(f"Job not found")
        
        if str(job.posted_by) != user_id:
            raise RoleNotAllowedError("Invalid role!")
        
        deleted = await self.job_repo.delete_job(id)
        if deleted:
            return {"message": "Job deleted successfully!"}



    