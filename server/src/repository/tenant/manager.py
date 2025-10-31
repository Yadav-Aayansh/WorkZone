from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Manager

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