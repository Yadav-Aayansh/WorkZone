from uuid import UUID
from src.core.celery import worker
from src.core.database import get_tenant_db_sync, get_public_db_sync
from src.models.tenant import LeaveEntitlement
from src.models.platform import Client, Setting
from sqlalchemy import select
from src.utils.datetime import get_indian_year
from src.core.logger import logger

@worker.task(bind=True, max_retries=3)
def create_leave_entitlement_task(self, tenant_id: str, employee_id: UUID):
    try:
        with get_public_db_sync() as public_db:
            client_id = public_db.execute(
                select(Client.id).where(Client.tenant_id==tenant_id)
            ).scalar_one_or_none()

            tenant_leaves = public_db.execute(
                select(Setting.leave_types).where(Setting.client_id==client_id)
            ).scalar_one_or_none()

        granted_days = {k: v["days"] for k, v in tenant_leaves.items()}

        with get_tenant_db_sync(tenant_id) as tenant_db:
            current_year = get_indian_year()
            leave_entitlement = LeaveEntitlement(
                employee_id=employee_id, fiscal_year=current_year, granted=granted_days
            )
            tenant_db.add(leave_entitlement)
            tenant_db.commit()

    except Exception as e:
        logger.error(e)
        raise

