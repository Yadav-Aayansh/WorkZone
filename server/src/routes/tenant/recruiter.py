from fastapi import APIRouter, Depends
from src.services.tenant import RecruiterService
from src.core.di import get_recruiter_service, get_current_user
from src.models.tenant import Role

recruiter_router = APIRouter(prefix="/recruiter", tags=["Tenant Recruiter"])

@recruiter_router.get(path="/me")
async def recruiter_profile(
    service: RecruiterService = Depends(get_recruiter_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.RECRUITER]))
):
    user_id = current_user.get("sub")
    return await service.profile(user_id)