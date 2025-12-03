from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Employee, LeaveEntitlement
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload, with_loader_criteria
from typing import Optional

class EmployeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_employee(self, user_id: str, title: str, manager_id: str):
        new_employee = Employee(
            user_id=user_id,
            title=title,
            manager_id=manager_id
        )

        self.db.add(new_employee)
        await self.db.flush()
        return new_employee
    
    async def get_employee_by_user_id(self, user_id: str, full_info_year: Optional[int] = None):
        query = select(Employee).where(Employee.user_id == user_id)
        if full_info_year:
            query = query.options(
                joinedload(Employee.user),
                selectinload(Employee.leave_entitlements),
                with_loader_criteria(LeaveEntitlement, LeaveEntitlement.fiscal_year == full_info_year)
            )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()