from fastapi import APIRouter, Depends
from src.core.di import get_tenant_id
from .auth import auth_router

from .test import test_router

tenant_router = APIRouter(
    prefix="/api/tenant",
    dependencies=[Depends(get_tenant_id)]
)

tenant_router.include_router(auth_router)
tenant_router.include_router(test_router)
