import sys, os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import engine_from_config, pool, text
from alembic import context
from src.core.database import PublicBase, TenantBase
from src.core.config import Config

from src.models.platform import *
from src.models.tenant import *

config = context.config
config.set_main_option("sqlalchemy.url", Config.SYNC_DATABASE_URL)

# Detect which config is being used
config_file = config.config_file_name
is_tenant = "tenant" in config_file if config_file else False

if is_tenant:
    target_metadata = TenantBase.metadata
    version_table = "alembic_version"
else:
    target_metadata = PublicBase.metadata
    version_table = "alembic_version_public"

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table=version_table,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    
    with connectable.connect() as connection:
        if not is_tenant:
            # PUBLIC migrations
            connection.execute(text("SET search_path TO public"))
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                version_table=version_table,
                version_table_schema="public",
                include_schemas=False,
            )
            with context.begin_transaction():
                context.run_migrations()
        else:
            # TENANT migrations
            result = connection.execute(text(
                "SELECT tenant_id FROM public.clients WHERE tenant_id IS NOT NULL"
            ))
            tenants = [row[0] for row in result]
            
            # DON'T do this table creation during stamp - remove it:
            # raw_conn = connection.connection.dbapi_connection
            # cursor = raw_conn.cursor()
            # for tenant_id in tenants:
            #     cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{tenant_id}"')
            #     cursor.execute(f"""CREATE TABLE IF NOT EXISTS...""")
            
            for tenant_id in tenants:
                print(f"Migrating tenant: {tenant_id}")
                connection.execute(text(f'SET search_path TO "{tenant_id}"'))
                
                context.configure(
                    connection=connection,
                    target_metadata=target_metadata,
                    version_table=version_table,
                    version_table_schema=tenant_id,
                    include_schemas=False,
                )
                
                with context.begin_transaction():
                    context.run_migrations()
                    
                print(f"✓ Migrated {tenant_id}")
                
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()