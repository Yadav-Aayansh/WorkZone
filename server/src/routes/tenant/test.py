from fastapi import APIRouter, Depends
from src.core.di import get_tenant_id

test_router = APIRouter()

@test_router.get(path="/test")
def test(tenant_id = Depends(get_tenant_id)):
    return f"Hi from {tenant_id}"