import pytest
import httpx
import uuid

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

EMPLOYEE_EMAIL = "employee@example.com"
EMPLOYEE_PASSWORD = "password123"
APPLICANT_EMAIL = "applicant@example.com"
APPLICANT_PASSWORD = "password123"

EMPLOYEE_TOKEN = None
APPLICANT_TOKEN = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_employee():
    """Login as employee."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD})
        if resp.status_code == 200:
            global EMPLOYEE_TOKEN
            EMPLOYEE_TOKEN = resp.json()["access_token"]

@pytest.mark.asyncio
async def test_login_applicant():
    """Login as applicant."""
    async with httpx.AsyncClient(verify=False) as client:
        await client.post(f"{BASE_URL}/auth/signup", json={
            "name": "Test Applicant", "email": APPLICANT_EMAIL, "password": APPLICANT_PASSWORD, "role": "applicant"
        })
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": APPLICANT_EMAIL, "password": APPLICANT_PASSWORD})
        if resp.status_code == 200:
            global APPLICANT_TOKEN
            APPLICANT_TOKEN = resp.json()["access_token"]

# Profile Tests

@pytest.mark.asyncio
async def test_get_employee_profile():
    """Test getting employee profile"""
    if not EMPLOYEE_TOKEN:
        pytest.skip("No employee token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/employee/me", headers={"Authorization": f"Bearer {EMPLOYEE_TOKEN}"})
        print("Get employee profile:", response.status_code)
        assert response.status_code == 200
        assert response.json()["role"] == "EMPLOYEE"

@pytest.mark.asyncio
async def test_employee_profile_unauthorized():
    """Test accessing profile without token"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/employee/me")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_employee_profile_wrong_role():
    """Test applicant accessing employee profile"""
    if not APPLICANT_TOKEN:
        pytest.skip("No applicant token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/employee/me", headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        assert response.status_code == 403
