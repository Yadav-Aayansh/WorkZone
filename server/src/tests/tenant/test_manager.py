import pytest
import httpx
import uuid

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

MANAGER_EMAIL = "manager@example.com"
MANAGER_PASSWORD = "password123"
EMPLOYEE_EMAIL = "employee@example.com"
EMPLOYEE_PASSWORD = "password123"

MANAGER_TOKEN = None
EMPLOYEE_TOKEN = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_manager():
    """Login as manager."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": MANAGER_EMAIL, "password": MANAGER_PASSWORD})
        if resp.status_code == 200:
            global MANAGER_TOKEN
            MANAGER_TOKEN = resp.json()["access_token"]

@pytest.mark.asyncio
async def test_login_employee():
    """Login as employee."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD})
        if resp.status_code == 200:
            global EMPLOYEE_TOKEN
            EMPLOYEE_TOKEN = resp.json()["access_token"]

# Profile Tests

@pytest.mark.asyncio
async def test_get_manager_profile():
    """Test getting manager profile"""
    if not MANAGER_TOKEN:
        pytest.skip("No manager token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/manager/me", headers={"Authorization": f"Bearer {MANAGER_TOKEN}"})
        print("Get manager profile:", response.status_code)
        assert response.status_code == 200
        assert response.json()["role"] == "MANAGER"

@pytest.mark.asyncio
async def test_manager_profile_unauthorized():
    """Test accessing profile without token"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/manager/me")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_manager_profile_wrong_role():
    """Test employee accessing manager profile"""
    if not EMPLOYEE_TOKEN:
        pytest.skip("No employee token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/manager/me", headers={"Authorization": f"Bearer {EMPLOYEE_TOKEN}"})
        assert response.status_code == 403
