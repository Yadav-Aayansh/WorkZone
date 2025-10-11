from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.schema import CreateSchema
from .config import Config

class PublicBase(DeclarativeBase):
    metadata = MetaData(schema="public")

class TenantBase(DeclarativeBase):
    pass

async_engine = create_async_engine(url=Config.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=async_engine)

async def init_db() -> None:
    async with async_engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        
        await conn.run_sync(PublicBase.metadata.create_all)

async def get_public_db() -> AsyncSession:
    async for sesion in get_tenant_db("public"):
        yield sesion 

async def get_tenant_db(tenant_id: str) -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(f"SET search_path TO {tenant_id}"))
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_tenant_schema(tenant_id: str):
    async with async_engine.begin() as conn:
        await conn.execute(CreateSchema(tenant_id, if_not_exists=True))
        
        def create_tables(sync_conn):
            sync_conn.execution_options(schema_translate_map={None: tenant_id})
            TenantBase.metadata.create_all(bind=sync_conn)

        await conn.run_sync(create_tables)