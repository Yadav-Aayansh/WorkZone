from fastapi import APIRouter
from .test import test_router
from .auth import auth_router

tenant_router = APIRouter(prefix="/api/tenant")

tenant_router.include_router(test_router)
tenant_router.include_router(auth_router)
