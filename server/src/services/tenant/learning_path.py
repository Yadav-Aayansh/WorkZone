from uuid import UUID
from fastapi import HTTPException
from src.repository.tenant import EmployeeRepository, LearningPathRepository
from src.exceptions.tenant import EmployeeNotFoundError
from src.genai import generate_learning_plan
from src.genai.schemas import LearningPlanResponse
from src.core.logger import logger

class LearningPathService:
    def __init__(
        self, 
        employee_repo: EmployeeRepository, 
        learning_path_repo: LearningPathRepository
    ):
        self.employee_repo = employee_repo
        self.learning_path_repo = learning_path_repo

    async def generate_path(self, user_id: UUID, career_goal: str) -> LearningPlanResponse:
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee profile not found.")

        resume_blob_name = getattr(employee, "resume", None)
        current_role = getattr(employee, "title", None)
        
        if not resume_blob_name:
            raise HTTPException(status_code=400, detail="No resume found.")
        
        if not current_role:
            raise HTTPException(status_code=400, detail="Employee job title not found.")

        try:
            plan_response = await generate_learning_plan(
                resume_blob_name=resume_blob_name,
                current_role=current_role,
                career_goal=career_goal
            )
        except Exception as e:
            logger.error(f"GenAI Learning Path Error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate learning path: {str(e)}")

        if plan_response.plan_title == "Error":
            raise HTTPException(status_code=500, detail=plan_response.plan_summary)

        path_data = {
            "employee_id": employee.id,
            "career_goal": career_goal,
            "current_role_snapshot": current_role,
            "resume_ref": resume_blob_name,
            "plan_data": plan_response.model_dump()
        }
        
        await self.learning_path_repo.create_learning_path(path_data)

        return plan_response

    async def get_my_paths(self, user_id: UUID):
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError("Employee not found.")
            
        paths = await self.learning_path_repo.get_paths_by_employee_id(employee.id)
        
        return [LearningPlanResponse(**path.plan_data) for path in paths]