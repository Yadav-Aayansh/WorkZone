from src.repository.tenant import UserRepository, EmployeeRepository
from src.exceptions.tenant import UserNotFoundError, EmployeeNotFoundError
from src.schemas.tenant import EmployeeProfileResponse

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