from uuid import UUID
from typing import Dict, Any
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.platform import Setting

class SettingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_client_id(self, client_id: UUID) -> Setting | None:
        result = await self.db.execute(select(Setting).where(Setting.client_id==client_id))
        return result.scalar_one_or_none()
    
    async def create(self, client_id: UUID, leave_types: Dict[str, Any] | None = None) -> Setting:
        if leave_types:
            setting = Setting(client_id=client_id, leave_types=leave_types)
        else:
            setting = Setting(client_id=client_id)
        self.db.add(setting)
        await self.db.commit()
        await self.db.refresh(setting)
        return setting

    async def get_or_create(self, client_id: UUID) -> Setting:
        setting = await self.get_by_client_id(client_id)
        if not setting:
            setting = await self.create(client_id)
        return setting
    
    async def update_leave_types(self, client_id: UUID, leave_types: Dict[str, Any]) -> Setting:
        setting = await self.get_by_client_id(client_id)
        setting.leave_types = leave_types
        await self.db.commit()
        await self.db.refresh(setting)
        return setting
    
    async def set_policy_docs(self, client_id: UUID, docs: list[str]):
        setting = await self.get_by_client_id(client_id)
        setting.policy_docs = docs
        await self.db.commit()
        await self.db.refresh(setting)
        return setting
    
    async def append_policy_docs(self, client_id: UUID, docs: list[str]):
        stmt = (
            update(Setting)
            .where(Setting.client_id == client_id)
            .values(policy_docs=Setting.policy_docs + docs)
            .returning(Setting)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()
    
    async def delete_policy_doc(self, client_id: UUID, doc: str):
        stmt = (
            update(Setting)
            .where(Setting.client_id == client_id)
            .values(policy_docs=func.array_remove(Setting.policy_docs, doc))
            .returning(Setting)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalar_one()