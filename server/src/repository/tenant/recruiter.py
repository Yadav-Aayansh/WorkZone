from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Recruiter
from sqlalchemy import func, select
from uuid import UUID

class RecruiterRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_recruiter(self, user_id: str):
        new_recruiter = Recruiter(
            user_id=user_id
        )

        self.db.add(new_recruiter)
        await self.db.flush()
        return new_recruiter
    
    async def get_recruiter_by_user_id(self, user_id: str):
        result = await self.db.execute(select(Recruiter).where(Recruiter.user_id==user_id))
        return result.scalar_one_or_none()
    
    async def get_random_recruiter(self) -> UUID | None:
        result = await self.db.execute(select(Recruiter.id).order_by(func.random()).limit(1))
        return result.scalar_one_or_none()