from src.repository.tenant import UserRepository, EmployeeRepository
from src.exceptions.tenant import UserNotFoundError, EmployeeNotFoundError
from src.genai.schemas import ChatRequest, ChatResponse
from src.schemas.tenant import EmployeeProfileResponse, EmployeeInfo
from src.genai.hr_policy import chat_with_context
from src.core.context import tenant_context
from uuid import UUID
from typing import Optional
from src.utils.datetime import get_indian_year

class EmployeeService:
    def __init__(self, user_repo: UserRepository, employee_repo: EmployeeRepository):
        self.user_repo = user_repo
        self.employee_repo = employee_repo

    async def profile(self, user_id: str):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User does not exist!")
        
        employee = await self.employee_repo.get_employee_by_user_id(user_id)
        if not employee:
            raise EmployeeNotFoundError(f"Employee does not exist!")
        
        return EmployeeProfileResponse(
            user_id=user.id,
            employee_id=employee.id,
            name=user.name,
            email=user.email
        )
    
    async def helpdesk(self, user_id: str, query: str, chat_id: Optional[str]) -> ChatResponse:
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User does not exist!")
        
        current_year = get_indian_year()
        employee = await self.employee_repo.get_employee_by_user_id(user_id, current_year)
        if not employee:
            raise EmployeeNotFoundError(f"Employee does not exist!")
        
        employee_info = EmployeeInfo(
            name=employee.user.name,
            title=employee.title,
            granted=employee.leave_entitlements[0].granted,
            used=employee.leave_entitlements[0].used,
            balance=employee.leave_entitlements[0].balance
        )

        tenant_id = tenant_context.get()
        if chat_id:
            request = ChatRequest(query=query, chat_id=chat_id, user_info=employee_info.model_dump(), chroma_db_path=f"platform/chroma_db/{tenant_id}")
        else:
            request = ChatRequest(query=query, user_info=employee_info.model_dump(), chroma_db_path=f"platform/chroma_db/{tenant_id}")

        return await chat_with_context(request)
    
        
