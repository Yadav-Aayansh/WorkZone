import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool, text

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.core.config import Config as AppConfig 
from src.core.database import TenantBase  
import src.models.tenant

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", AppConfig.SYNC_DATABASE_URL)

target_metadata = TenantBase.metadata


def _resolve_tenant_id() -> str:
    x_args = context.get_x_argument(as_dictionary=True)
    tenant_id = x_args.get("tenant")
    if not tenant_id:
        raise RuntimeError(
            "Tenant id is required. Pass it with: -x tenant=<tenant_id>"
        )
    if not tenant_id.isidentifier():
        raise ValueError(f"Invalid tenant id: {tenant_id!r}")
    return tenant_id


def include_object(object_, name, type_, reflected, compare_to):
    if type_ == "table":
        if name == "alembic_version":
            return False
        schema = getattr(object_, "schema", None)
        if schema is not None:
            return False
    return True


def run_migrations_offline() -> None:
    tenant_id = _resolve_tenant_id()

    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=False,
        include_object=include_object,
        version_table_schema=tenant_id,
    )
    with context.begin_transaction():
        context.execute(f"SET search_path TO {tenant_id}")
        context.run_migrations()


def run_migrations_online() -> None:
    tenant_id = _resolve_tenant_id()

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{tenant_id}"'))
        connection.execute(text(f'SET search_path TO "{tenant_id}"'))

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=False,
            include_object=include_object,
            version_table_schema=tenant_id,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
