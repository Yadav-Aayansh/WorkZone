import pytest
import httpx
import uuid

# Configuration
BASE_URL = "https://workzone.tech/api/platform"
AUTH_URL = f"{BASE_URL}/auth"

TEST_EMAIL = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
TEST_PASSWORD = "$Raghav123"
TEST_NAME = "Raghav TestUser"

PLATFORM_TOKEN = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_platform_admin():
    """Signup/Login as platform admin."""
    async with httpx.AsyncClient(verify=False) as client:
        # Signup
        await client.post(f"{AUTH_URL}/signup", json={
            "name": TEST_NAME, "email": TEST_EMAIL, "password": TEST_PASSWORD
        })
        
        # Login
        login_resp = await client.post(f"{AUTH_URL}/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        if login_resp.status_code == 200:
            global PLATFORM_TOKEN
            PLATFORM_TOKEN = login_resp.json()["access_token"]
            assert PLATFORM_TOKEN

# Workspace Tests

@pytest.mark.asyncio
async def test_list_workspaces():
    """Test listing workspaces (tenants)"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        pass
