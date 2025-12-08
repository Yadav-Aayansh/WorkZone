from src.repository.tenant import JobRepository, ApplicationRepository
from fastapi import UploadFile
from src.exceptions.tenant import (
    JobNotFoundError, UnauthorizedAccessError, ApplicationNotFoundError,
    ApplicationAlreadyExistsError
)
from src.core.storage import storage_client
from src.core.context import tenant_context
from src.core.logger import logger
from src.models.tenant import Application, ApplicationStatus
from sqlalchemy.orm import selectinload

class ApplicationService:
    def __init__(self, job_repo: JobRepository, application_repo: ApplicationRepository):
        self.job_repo = job_repo
        self.application_repo = application_repo

    async def apply(self, job_id: str, user_id: str, resume: UploadFile):
        is_job = await self.job_repo.get_job_by_id(job_id)
        if not is_job:
            raise JobNotFoundError(f"Job not found!")
        
        application = await self.application_repo.get_application_by_user_job_id(user_id, job_id)
        if application:
            raise ApplicationAlreadyExistsError("Application already exists!")

        storage_client.validate_file(resume, [".pdf"], 10)
        tenant_id = tenant_context.get()
        blob_name, url = storage_client.upload(resume, f"tenant/{tenant_id}/resume")


        return await self.application_repo.apply_job(job_id, user_id, blob_name)


    async def list_applications(self, job_id: str, user_id: str):
        job = await self.job_repo.get_job_by_id(job_id)
        if not job:
            raise JobNotFoundError(f"Job not found")
        
        if str(job.posted_by) != user_id:
            raise UnauthorizedAccessError("Access denied!")
        applications = await self.application_repo.get_applications_by_job_id(job_id)
        for app in applications:
            app.resume = storage_client.get_url(app.resume)
        return applications
    
    async def get_application(self, id: str, user_id: str, is_recruiter: bool = False):
        application = await self.application_repo.get_application_by_id(id, options=[selectinload(Application.job)])
        if not application:
            raise ApplicationNotFoundError("Application not found")
    
        if is_recruiter:
            if str(application.job.posted_by) != user_id:
                raise UnauthorizedAccessError("Access denied!")
        elif str(application.user_id) != user_id:
                raise UnauthorizedAccessError("Access denied!")
        return application
    
    async def my_applications(self, user_id: str):
        return await self.application_repo.get_applications_by_user_id(user_id)
    
    async def withdraw_application(self, id: str, user_id: str):
        application = await self.application_repo.get_application_by_id(id)
        if not application:
            raise ApplicationNotFoundError("Application not found")
    
        if str(application.user_id) != user_id:  
            raise UnauthorizedAccessError("Access denied!")
        
        return await self.application_repo.update_application_status(id, ApplicationStatus.WITHDRAWN)
