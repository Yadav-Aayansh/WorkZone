from fastapi import APIRouter, Depends, HTTPException
from src.schemas.tenant import (
    CreateJobRequest, JobResponse
)
from src.core.di import get_tenant_id, get_job_service, get_current_user
from src.services.tenant import JobService
from src.core.config import Config
from src.models.tenant import Role


job_router = APIRouter(tags=["Tenant Job"])

@job_router.post(path="/job", status_code=201, response_model=JobResponse)
async def create_job(
    data: CreateJobRequest,
    service: JobService = Depends(get_job_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.create_job(data, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


