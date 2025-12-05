from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List

from src.core.di import get_learning_path_service, get_current_user
from src.services.tenant import LearningPathService
from src.genai.schemas import LearningPlanResponse
from src.models.tenant import Role
from src.exceptions.tenant import EmployeeNotFoundError
from src.schemas.tenant import GeneratePathRequest

learning_router = APIRouter(prefix="/learning", tags=["Tenant Learning"])

@learning_router.post("/generate", response_model=LearningPlanResponse)
async def generate_path(
    request: GeneratePathRequest,
    service: LearningPathService = Depends(get_learning_path_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    user_id = UUID(current_user.get("sub"))
    try:
        return await service.generate_path(
            user_id=user_id, 
            career_goal=request.career_goal
        )
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@learning_router.get("/", response_model=List[LearningPlanResponse])
async def get_paths(
    service: LearningPathService = Depends(get_learning_path_service),
    current_user = Depends(get_current_user(use_tenant=True, roles=[Role.EMPLOYEE]))
):
    user_id = UUID(current_user.get("sub"))
    try:
        return await service.get_my_paths(user_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))