from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy import text, MetaData, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.schema import CreateSchema
from .config import Config
from typing import AsyncGenerator, Generator
from contextlib import contextmanager

class PublicBase(DeclarativeBase):
    metadata = MetaData(schema="public")

class TenantBase(DeclarativeBase):
    pass

from src.models.tenant import *

async_engine = create_async_engine(url=Config.ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=async_engine)

async def init_db() -> None:
    async with async_engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        
        await conn.run_sync(PublicBase.metadata.create_all)

async def get_public_db() -> AsyncGenerator[AsyncSession, None]:
    async for sesion in get_schema("public"):
        yield sesion 

async def get_schema(tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
    if not tenant_id.isidentifier():
        raise ValueError("Invalid tenant ID")
    
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(f"SET search_path TO {tenant_id}"))
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


sync_engine = create_engine(url=Config.SYNC_DATABASE_URL, echo=True)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

def create_tenant_schema(tenant_id: str):
    with sync_engine.begin() as conn:
        conn.execute(CreateSchema(tenant_id, if_not_exists=True))
        conn.execute(text(f"SET search_path TO {tenant_id}"))
        TenantBase.metadata.create_all(bind=conn)


@contextmanager
def get_public_db_sync() -> Generator[Session, None, None]:
    with get_tenant_db_sync("public") as session:
        yield session

@contextmanager
def get_tenant_db_sync(tenant_id: str) -> Generator[Session, None, None]:
    if not tenant_id.isidentifier():
        raise ValueError("Invalid tenant ID")
    
    session = SyncSessionLocal()
    try:
        session.execute(text(f"SET search_path TO {tenant_id}"))
        yield session
        session.commit()
    except:
        session.rollback()
        raise
    finally:
        session.close()
