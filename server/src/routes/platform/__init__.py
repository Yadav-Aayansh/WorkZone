from fastapi import APIRouter
from .auth import auth_router
from .client import client_router

platform_router = APIRouter(prefix="/api/platform")

platform_router.include_router(auth_router)
platform_router.include_router(client_router)