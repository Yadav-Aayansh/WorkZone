"""Apply alembic_tenant migrations across every tenant.

Reads tenant ids from ``public.clients.tenant_id`` and runs the requested
alembic command against each one in turn. The script just shells out to the
``alembic -c alembic_tenant.ini -x tenant=<id> ...`` invocation so behavior
stays identical to running the migration by hand.

Examples (run from repo root):

    # Upgrade every tenant to latest
    python scripts/tenant_migrate.py upgrade head

    # Stamp every tenant at head without running migrations
    python scripts/tenant_migrate.py stamp head

    # Show current revision per tenant
    python scripts/tenant_migrate.py current

    # Restrict to one tenant (mostly useful for debugging this script)
    python scripts/tenant_migrate.py upgrade head --tenant acme

    # Stop on the first failure instead of continuing
    python scripts/tenant_migrate.py upgrade head --fail-fast
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from sqlalchemy import create_engine, text  # noqa: E402

from src.core.config import Config  # noqa: E402


def fetch_tenant_ids() -> list[str]:
    engine = create_engine(Config.SYNC_DATABASE_URL)
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT tenant_id FROM public.clients "
                "WHERE tenant_id IS NOT NULL ORDER BY tenant_id"
            )
        ).all()
    return [r[0] for r in rows]


def run_for_tenant(tenant_id: str, alembic_args: list[str]) -> int:
    cmd = [
        "alembic",
        "-c",
        "alembic_tenant.ini",
        "-x",
        f"tenant={tenant_id}",
        *alembic_args,
    ]
    print(f"\n=== [{tenant_id}] {' '.join(cmd)} ===", flush=True)
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run an alembic command against every tenant schema.",
        usage="python scripts/tenant_migrate.py <alembic args...> [--tenant T] [--fail-fast]",
    )
    parser.add_argument(
        "--tenant",
        help="Restrict to a single tenant (default: every tenant in public.clients).",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Abort on first failing tenant instead of continuing.",
    )
    parser.add_argument(
        "alembic_args",
        nargs=argparse.REMAINDER,
        help="Arguments forwarded to alembic (e.g. 'upgrade head').",
    )
    args = parser.parse_args()

    if not args.alembic_args:
        parser.error("No alembic command supplied. Example: upgrade head")

    if args.tenant:
        tenants = [args.tenant]
    else:
        tenants = fetch_tenant_ids()
        if not tenants:
            print("No tenants found in public.clients.tenant_id; nothing to do.")
            return 0

    print(f"Targeting {len(tenants)} tenant(s): {', '.join(tenants)}")

    failures: list[str] = []
    for tenant_id in tenants:
        rc = run_for_tenant(tenant_id, args.alembic_args)
        if rc != 0:
            failures.append(tenant_id)
            if args.fail_fast:
                print(f"\nFAILED on tenant {tenant_id} (exit {rc}). Aborting.")
                return rc

    if failures:
        print(f"\nCompleted with failures: {', '.join(failures)}")
        return 1

    print("\nAll tenants completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
