from fastapi import APIRouter, Depends, HTTPException
from src.schemas.tenant import (
    CreateJobRequest, JobResponse, ListJobsRequest, UpdateJobRequest, CloseJobRequest
)
from src.core.di import get_job_service, get_current_user
from src.services.tenant import JobService
from src.core.config import Config
from src.models.tenant import Role
from typing import List
from src.exceptions.tenant import JobNotFoundError
from src.exceptions.base import RoleNotAllowedError
from src.genai.jd_builder.main import generate_jd
from src.genai.schemas.jd_builder_schemas import JDBuilderPrompt

job_router = APIRouter(prefix="/jobs", tags=["Tenant Job"])

@job_router.post(path="", status_code=201, response_model=JobResponse)
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


@job_router.get(path="", response_model=List[JobResponse])
async def list_jobs(
    data: ListJobsRequest = Depends(),
    service: JobService = Depends(get_job_service),
):
    try:
        return await service.list_jobs(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@job_router.get(path="/{job_id}", status_code=200, response_model=JobResponse)
async def get_job(
    job_id: str,
    service: JobService = Depends(get_job_service)
):
    try:
        return await service.get_job(job_id)
    except JobNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@job_router.patch(path="/{job_id}", status_code=200, response_model=JobResponse)
async def update_job(
    job_id: str,
    data: UpdateJobRequest,
    service: JobService = Depends(get_job_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.update_job(job_id, user_id, data)
    except JobNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
    except RoleNotAllowedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@job_router.post(path="/{job_id}/close", status_code=200, response_model=JobResponse)
async def close_job(
    job_id: str,
    data: CloseJobRequest, 
    service: JobService = Depends(get_job_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.close_job(job_id, user_id, data.top_x)
    except JobNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
    except RoleNotAllowedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@job_router.delete(path="/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    service: JobService = Depends(get_job_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        user_id = current_user.get("sub")
        await service.delete_job(job_id, user_id)
    except JobNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
    except RoleNotAllowedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


# AI Features

@job_router.post(path="/ai/enhance-description")
async def job_description_enhancer(prompt: JDBuilderPrompt):
    return generate_jd(prompt)