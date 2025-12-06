from fastapi import APIRouter, Depends
from src.services.tenant import ApplicantService
from src.core.di import get_applicant_service, get_current_user
from src.models.tenant import Role

applicant_router = APIRouter(prefix="/applicant", tags=["Tenant Applicant"])

@applicant_router.get(path="/me")
async def applicant_profile(
    service: ApplicantService = Depends(get_applicant_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.APPLICANT]))
):
    user_id = current_user.get("sub")
    return await service.profile(user_id)