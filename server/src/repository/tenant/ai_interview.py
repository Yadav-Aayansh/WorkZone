from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import AiInterview

class AiInterviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

