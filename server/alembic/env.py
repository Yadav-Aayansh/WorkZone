import sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import engine_from_config, pool, text
from alembic import context
from src.core.database import PublicBase, TenantBase
from src.core.config import Config

from src.models.platform import Client, Order, Setting
from src.models.tenant import User, Recruiter, Manager, Employee, Applicant, Job, Application, AiInterview

config = context.config
config.set_main_option("sqlalchemy.url", Config.SYNC_DATABASE_URL)

migration_type = os.getenv("MIGRATION_TYPE", "public")

if migration_type == "public":
    target_metadata = PublicBase.metadata
else:
    target_metadata = TenantBase.metadata


if migration_type == "public":
    config.set_main_option("version_locations", "alembic/versions/public")
else:
    config.set_main_option("version_locations", "alembic/versions/tenant")

def run_migrations_online() -> None:
    print(f"Starting migration - Type: {migration_type}")
    
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    
    print(f"Connected to database")
    
    with connectable.connect() as connection:
        if migration_type == "public":
            print("Setting search_path to public")
            connection.execute(text("SET search_path TO public"))
            connection.commit()
            
            print("Configuring context for public")
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                version_table="alembic_version_public",
                version_table_schema="public"
            )
            
            print("Running migrations")
            with context.begin_transaction():
                context.run_migrations()
            print("DONE!")
            
if context.is_offline_mode():
    pass
else:
    run_migrations_online()