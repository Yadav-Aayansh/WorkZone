from fastapi import APIRouter
from .test import test_router

tenant_router = APIRouter(prefix="/api/tenant")

tenant_router.include_router(test_router)
