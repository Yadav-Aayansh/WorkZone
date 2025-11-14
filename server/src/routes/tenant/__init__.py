from fastapi import APIRouter, Depends
from src.core.di import get_tenant_id
from .auth import auth_router
from .config import config_router
from .recruiter import recruiter_router
from .manager import manager_router
from .employee import employee_router
from .applicant import applicant_router
from .job import job_router
from .application import application_router
from .ai_interview import ai_interview_router

from .test import test_router

tenant_router = APIRouter(
    prefix="/api/tenant",
    dependencies=[Depends(get_tenant_id)]
)

tenant_router.include_router(auth_router)
tenant_router.include_router(config_router)
tenant_router.include_router(recruiter_router)
tenant_router.include_router(manager_router)
tenant_router.include_router(employee_router)
tenant_router.include_router(applicant_router)
tenant_router.include_router(job_router)
tenant_router.include_router(application_router)
# tenant_router.include_router(ai_interview_router)
tenant_router.include_router(test_router)
