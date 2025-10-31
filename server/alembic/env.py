from logging.config import fileConfig
import sys
import os
from alembic import context
from sqlalchemy import engine_from_config, pool

# ─── Add project root to sys.path ─────────────────────────────────────
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ─── Import app modules ───────────────────────────────────────────────
from db import Base
from config import Config
import models  # import so Alembic can discover all models

# ─── Alembic Config ───────────────────────────────────────────────────
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ─── Metadata for 'autogenerate' ──────────────────────────────────────
target_metadata = Base.metadata

# ─── Set SQLAlchemy URL from your config.py ───────────────────────────
config.set_main_option("sqlalchemy.url", Config.ASYNC_DATABASE_URL)

# ─── Offline Migrations ───────────────────────────────────────────────
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# ─── Online Migrations ────────────────────────────────────────────────
def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

# ─── Entry Point ──────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()