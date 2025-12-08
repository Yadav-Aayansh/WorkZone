from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence

from src.models.tenant import Query, QueryStatus

class QueryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_query(self, query_data: dict) -> Query:
        new_query = Query(**query_data)
        self.db.add(new_query)
        await self.db.commit()
        await self.db.refresh(new_query)
        return new_query

    async def get_query_by_id(self, query_id: UUID) -> Query | None:
        result = await self.db.execute(select(Query).where(Query.id == query_id))
        return result.scalar_one_or_none()

    async def update_response(self, query_id: UUID, response_text: str) -> Query | None:
        query = await self.get_query_by_id(query_id)
        if query:
            query.response_text = response_text
            query.status = QueryStatus.CLOSED
            
            await self.db.commit()
            await self.db.refresh(query)
        return query
    
    async def get_queries_by_employee_id(self, employee_id: UUID) -> Sequence[Query]:
        query = select(Query).where(Query.employee_id == employee_id).order_by(Query.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_queries_by_recruiter_id(self, recruiter_id: UUID) -> Sequence[Query]:
        query = select(Query).where(Query.recruiter_id == recruiter_id).order_by(Query.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()