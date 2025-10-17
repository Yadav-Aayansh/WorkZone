from sqlalchemy.ext.asyncio import AsyncSession
from src.models.platform import Client
from sqlalchemy import exists, select
from datetime import datetime

class ClientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_client_by_id(self, id: str) -> Client | None:
        result = await self.db.execute(select(Client).where(Client.id==id))
        return result.scalar_one_or_none()

    async def get_client_by_email(self, email: str) -> Client | None:
        result = await self.db.execute(select(Client).where(Client.email==email))
        return result.scalar_one_or_none()

    async def create_client(self, name: str, email: str, password: str) -> Client:
        try:
            new_client = Client(
                name=name,
                email=email,
                password=password
            )
            self.db.add(new_client)
            await self.db.commit()
            await self.db.refresh(new_client)
            return new_client
        except Exception:
            await self.db.rollback()
            raise

    async def is_tenant_exist(self, tenant_id: str) -> bool:
        result = await self.db.execute(select(exists().where(Client.tenant_id==tenant_id)))
        return result.scalar()
    
    async def setup_onboarding(self, id: str, tenant_id: str, brand_name: str, logo: str) -> Client | None:
        try:
            client = await self.get_client_by_id(id)
            client.tenant_id = tenant_id
            client.brand_name = brand_name
            client.logo = logo
            await self.db.commit()
            await self.db.refresh(client)
            return client
        except Exception:
            await self.db.rollback()
            raise

    async def update_subscription(self, id: str, plan: str, started_at: datetime, expires_at: datetime):
        try:
            client = await self.get_client_by_email(id)
            client.plan_duration = plan
            client.plan_started_at = started_at
            client.plan_expires_at = expires_at
            await self.db.commit()
            await self.db.refresh(client)
            return client
        except Exception:
            await self.db.rollback()
            print()





