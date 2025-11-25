from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Employee
from sqlalchemy import select

class EmployeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_employee(self, user_id: str, manager_id: str):
        new_employee = Employee(
            user_id=user_id,
            manager_id=manager_id
        )

        self.db.add(new_employee)
        await self.db.flush()
        return new_employee
    
    async def get_employee_by_user_id(self, user_id: str):
        result = await self.db.execute(select(Employee).where(Employee.user_id==user_id))
        return result.scalar_one_or_none()