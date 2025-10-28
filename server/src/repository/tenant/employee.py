from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Employee

class EmployeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_employee(self, user_id: str):
        new_employee = Employee(
            user_id=user_id
        )

        self.db.add(new_employee)
        await self.db.flush()
        return new_employee