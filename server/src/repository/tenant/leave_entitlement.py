from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import LeaveEntitlement
from sqlalchemy import select

class LeaveEntitlementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, employee_id: UUID, fiscal_year: int, granted: dict) -> LeaveEntitlement:
        entitlement = LeaveEntitlement(
            employee_id=employee_id,
            fiscal_year=fiscal_year,
            granted=granted
        )
        self.db.add(entitlement)
        await self.db.commit()
        await self.db.refresh(entitlement)
        return entitlement
    
    async def get(self, employee_id: UUID, fiscal_year: int) -> LeaveEntitlement:
        result = await self.db.execute(select(LeaveEntitlement).where(
            LeaveEntitlement.employee_id==employee_id, LeaveEntitlement.fiscal_year==fiscal_year)
        )
        return result.scalar_one_or_none()
    
    async def update_leaves(self, entitlement_id: UUID, leave_type: str, days: int) -> LeaveEntitlement:
        result = await self.db.execute(select(LeaveEntitlement).where(LeaveEntitlement.id == entitlement_id))
        entitlement = result.scalar_one()
        
        used = entitlement.used.copy()
        used[leave_type] = used.get(leave_type, 0) + days
        entitlement.used = used
        
        await self.db.commit()
        await self.db.refresh(entitlement)
        return entitlement