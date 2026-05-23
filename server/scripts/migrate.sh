#!/usr/bin/env sh
# One-shot migration entrypoint used by the `migrate` compose service.
# Order matters: the public/platform schema must exist (and hold the
# `clients` table) before we can enumerate tenants.
set -e

echo "==> Applying platform (public) migrations"
alembic -c alembic.ini upgrade head

# Iterates every tenant_id in public.clients and upgrades each schema.
# No-op (exit 0) on a fresh database with zero tenants.
echo "==> Applying tenant migrations across all tenants"
python scripts/tenant_migrate.py upgrade head

echo "==> Migrations complete"
