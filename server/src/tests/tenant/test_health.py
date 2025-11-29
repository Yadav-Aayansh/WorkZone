import pytest
import httpx

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

@pytest.mark.asyncio
async def test_get_test():
    """Test getting test endpoint"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/test")
        print("Get test:", response.status_code)
        assert response.status_code in [200, 404]
