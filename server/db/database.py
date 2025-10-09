from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy import create_engine, text, MetaData
from sqlalchemy.schema import CreateSchema
from core.config import Config

class PublicBase(DeclarativeBase):
    metadata = MetaData(schema="public")

class TenantBase(DeclarativeBase):
    pass

engine = create_engine(url=Config.DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS public"))
        
    PublicBase.metadata.create_all(bind=engine)

def get_public_db() -> Session:
    yield from get_tenant_db("public")

def get_tenant_db(tenant_id: str) -> Session:
    db = SessionLocal()
    try:
        db.execute(text(f"SET search_path TO {tenant_id}"))
        yield db
    finally:
        db.close()

def create_tenant_schema(tenant_id: str):
    with engine.begin() as conn:
        conn.execute(CreateSchema(tenant_id, if_not_exists=True))
        
        conn = conn.execution_options(
            schema_translate_map={None: tenant_id}
        )
        TenantBase.metadata.create_all(bind=conn)