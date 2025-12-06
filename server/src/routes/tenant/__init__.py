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
from .leave import leave_router
from .learning_path import learning_router
from .query import query_router

# Tenant Routers (HTTP & WS)
tenant_router = APIRouter(prefix="/api/tenant")

# HTTP Routers
http_router = APIRouter(dependencies=[Depends(get_tenant_id)])

http_router.include_router(auth_router)
http_router.include_router(config_router)
http_router.include_router(recruiter_router)
http_router.include_router(manager_router)
http_router.include_router(employee_router)
http_router.include_router(applicant_router)
http_router.include_router(job_router)
http_router.include_router(application_router)
http_router.include_router(leave_router)
http_router.include_router(learning_router)
http_router.include_router(query_router)

tenant_router.include_router(http_router)

# WS Routers
tenant_router.include_router(ai_interview_router)


# Test
from .test import test_router
tenant_router.include_router(test_router)


