from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.tenant.learning_path import LearningPath
from typing import Sequence

class LearningPathRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_learning_path(self, data: dict) -> LearningPath:
        learning_path = LearningPath(**data)
        self.db.add(learning_path)
        await self.db.commit()
        await self.db.refresh(learning_path)
        return learning_path

    async def get_paths_by_employee_id(self, employee_id: UUID) -> Sequence[LearningPath]:
        query = select(LearningPath).where(LearningPath.employee_id == employee_id).order_by(LearningPath.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()