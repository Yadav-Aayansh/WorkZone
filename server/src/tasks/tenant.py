from src.core.celery import worker
from src.core.database import create_tenant_schema
from src.core.database import get_public_db_sync
from src.models.platform import Setting

@worker.task(bind=True, max_retries=3)
def create_tenant_schema_task(self, tenant_id: str):
    create_tenant_schema(tenant_id)

@worker.task(bind=True, max_retries=3)
def create_tenant_setting(self, client_id: str):
    with get_public_db_sync() as public_db:
        setting = Setting(client_id=client_id)
        public_db.add(setting)
        public_db.commit()