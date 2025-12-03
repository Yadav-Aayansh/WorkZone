from fastapi import APIRouter, Depends, HTTPException, UploadFile
from src.services.tenant import ApplicationService
from src.core.di import get_current_user, get_application_service
from src.models.tenant import Role
from src.schemas.tenant import ApplicationResponse
from src.exceptions.tenant import JobNotFoundError, UnauthorizedAccessError, ApplicationNotFoundError
from src.core.logger import logger


application_router = APIRouter(tags=["Tenant Application"])

@application_router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse)
async def apply(
    job_id: str,
    resume: UploadFile,
    service: ApplicationService = Depends(get_application_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.APPLICANT, Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.apply(job_id, user_id, resume)
    except JobNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@application_router.get("/jobs/{job_id}/applications")
async def list_applications(
    job_id: str,
    service: ApplicationService = Depends(get_application_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    try:
        user_id = current_user.get("sub")
        return await service.list_applications(job_id, user_id)
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))


@application_router.get("/applications")
async def my_applications(
    service: ApplicationService = Depends(get_application_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.APPLICANT, Role.EMPLOYEE]))
):
    user_id = current_user.get("sub")
    return await service.my_applications(user_id)

@application_router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    service: ApplicationService = Depends(get_application_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.APPLICANT, Role.EMPLOYEE, Role.RECRUITER]))
):
    user_id = current_user.get("sub")
    is_recruiter = current_user.get("role") == Role.RECRUITER.value
    try:
        return await service.get_application(application_id, user_id, is_recruiter)
    except ApplicationNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))
    
    
@application_router.delete("/applications/{application_id}/withdraw", response_model=ApplicationResponse)
async def withdraw_application(application_id: str,
    service: ApplicationService = Depends(get_application_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.APPLICANT, Role.EMPLOYEE]))
):
    try:
        user_id = current_user.get("sub")
        return await service.withdraw_application(application_id, user_id)
    except ApplicationNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except UnauthorizedAccessError as e:
        raise HTTPException(status_code=403, detail=str(e))
    