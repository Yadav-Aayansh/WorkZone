from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import Applicant
from sqlalchemy import select

class ApplicantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_applicant(self, user_id: str):
        new_applicant = Applicant(
            user_id=user_id
        )

        self.db.add(new_applicant)
        await self.db.flush()
        return new_applicant
    
        
    async def get_applicant_by_user_id(self, user_id: str):
        result = await self.db.execute(select(Applicant).where(Applicant.user_id==user_id))
        return result.scalar_one_or_none()