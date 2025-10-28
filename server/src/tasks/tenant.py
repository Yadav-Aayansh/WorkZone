from src.core.celery import worker
from src.core.database import create_tenant_schema

@worker.task(bind=True, max_retries=3)
def create_tenant_schema_task(self, tenant_id: str):
    create_tenant_schema(tenant_id)
