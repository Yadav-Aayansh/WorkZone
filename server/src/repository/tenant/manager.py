from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Manager
from sqlalchemy import select

class ManagerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_manager(self, user_id: str):
        new_manager = Manager(
            user_id=user_id
        )

        self.db.add(new_manager)
        await self.db.flush()
        return new_manager
    
    async def get_manager_by_user_id(self, user_id: str):
        result = await self.db.execute(select(Manager).where(Manager.user_id==user_id))
        return result.scalar_one_or_none()