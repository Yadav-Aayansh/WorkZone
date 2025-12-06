import pytest
import httpx

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

@pytest.mark.asyncio
async def test_get_config():
    """Test getting public config"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/config")
        print("Get config:", response.status_code)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
