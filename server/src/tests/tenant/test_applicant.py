import pytest
import httpx
import uuid

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

APPLICANT_EMAIL = "applicant@example.com"
APPLICANT_PASSWORD = "password123"
RECRUITER_EMAIL = "recruiter@example.com"
RECRUITER_PASSWORD = "password123"

APPLICANT_TOKEN = None
RECRUITER_TOKEN = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_applicant():
    """Login as applicant."""
    async with httpx.AsyncClient(verify=False) as client:
        # Try signup first
        await client.post(f"{BASE_URL}/auth/signup", json={
            "name": "Test Applicant", "email": APPLICANT_EMAIL, "password": APPLICANT_PASSWORD, "role": "applicant"
        })
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": APPLICANT_EMAIL, "password": APPLICANT_PASSWORD})
        if resp.status_code == 200:
            global APPLICANT_TOKEN
            APPLICANT_TOKEN = resp.json()["access_token"]

@pytest.mark.asyncio
async def test_login_recruiter():
    """Login as recruiter."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": RECRUITER_EMAIL, "password": RECRUITER_PASSWORD})
        if resp.status_code == 200:
            global RECRUITER_TOKEN
            RECRUITER_TOKEN = resp.json()["access_token"]

# Profile Tests

@pytest.mark.asyncio
async def test_get_applicant_profile():
    """Test getting applicant profile"""
    if not APPLICANT_TOKEN:
        pytest.skip("No applicant token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/applicant/me", headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        print("Get applicant profile:", response.status_code)
        assert response.status_code == 200
        assert response.json()["role"] == "APPLICANT"

@pytest.mark.asyncio
async def test_applicant_profile_unauthorized():
    """Test accessing profile without token"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/applicant/me")
        assert response.status_code == 403
@pytest.mark.asyncio
async def test_applicant_profile_wrong_role():
    """Test recruiter accessing applicant profile"""
    if not RECRUITER_TOKEN:
        pytest.skip("No recruiter token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/applicant/me", headers={"Authorization": f"Bearer {RECRUITER_TOKEN}"})
        assert response.status_code == 403
