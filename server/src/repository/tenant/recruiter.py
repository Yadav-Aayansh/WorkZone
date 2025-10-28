from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Recruiter

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