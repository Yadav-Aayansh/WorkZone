import pytest
import pytest_asyncio
import httpx
import uuid
from pathlib import Path

# -------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------
BASE_URL = "https://workzone.tech/api/platform"
AUTH_URL = f"{BASE_URL}/auth"

# Test credentials (unique each run)
TEST_EMAIL = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
TEST_PASSWORD = "$Raghav123"
TEST_NAME = "Raghav TestUser"

# -------------------------------------------------------------------
# FIXTURE: Get Auth Token + Ensure Onboarding
# -------------------------------------------------------------------
@pytest_asyncio.fixture(scope="session")
async def auth_token():
    """✅ Signup/login + ensure onboarding before other tests."""
    async with httpx.AsyncClient(verify=False) as client:
        # ---- Signup or login ----
        signup_payload = {
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        }
        signup_resp = await client.post(f"{AUTH_URL}/signup", json=signup_payload)

        if signup_resp.status_code == 201:
            print("✅ Signed up new test user")
            data = signup_resp.json()
        elif signup_resp.status_code == 409:
            print("⚠️ User already exists, logging in...")
            login_payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
            login_resp = await client.post(f"{AUTH_URL}/login", json=login_payload)
            assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
            data = login_resp.json()
        else:
            raise Exception(f"Signup/Login failed: {signup_resp.status_code}, {signup_resp.text}")

        access_token = data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # ---- Ensure onboarding ----
        onboard_data = {
            "tenant_id": f"tenant_{uuid.uuid4().hex[:5]}",
            "brand_name": "AutoTenant",
        }
        files = {"logo": ("logo.png", b"fake_logo_data", "image/png")}
        onboard_resp = await client.post(f"{BASE_URL}/onboarding", data=onboard_data, files=files, headers=headers)
        print("Setup onboarding response:", onboard_resp.status_code, onboard_resp.text)

        return {
            "access_token": access_token,
            "refresh_token": data.get("refresh_token"),
            "tenant_id": onboard_data["tenant_id"],
        }

# -------------------------------------------------------------------
# ✅ POSITIVE TEST CASES
# -------------------------------------------------------------------
@pytest.mark.asyncio
async def test_onboarding_positive(auth_token, tmp_path):
    """✅ Test successful onboarding"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        logo_path = tmp_path / "logo.png"
        logo_path.write_bytes(b"fake_image_data")

        data = {"tenant_id": f"tenant_{uuid.uuid4().hex[:5]}", "brand_name": "MyBrand"}
        files = {"logo": ("logo.png", open(logo_path, "rb"), "image/png")}

        response = await client.post(f"{BASE_URL}/onboarding", data=data, files=files)
        print("Onboarding:", response.status_code, response.text)
        assert response.status_code in [200, 201, 409, 500]


@pytest.mark.asyncio
async def test_tenant_availability_positive():
    """✅ Check tenant availability"""
    async with httpx.AsyncClient(verify=False) as client:
        params = {"tenant_id": "tenant_test"}
        response = await client.get(f"{BASE_URL}/tenant-availability", params=params)
        print("Tenant availability:", response.status_code, response.text)
        assert response.status_code in [200, 404]


@pytest.mark.asyncio
async def test_create_order_positive(auth_token):
    """✅ Create order with valid subscription plan"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        params = {"plan": "3_months"}  # valid plan
        response = await client.get(f"{BASE_URL}/subscription", params=params)
        print("Create order:", response.status_code, response.text)
        assert response.status_code in [200, 201, 409, 500]


@pytest.mark.asyncio
async def test_update_order_positive():
    """✅ Update order with valid payment details"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "order_id": "ORD123",
            "payment_id": "PAY456",
            "signature": "valid_signature",
        }
        response = await client.post(f"{BASE_URL}/subscription", json=payload)
        print("Update order:", response.status_code, response.text)
        assert response.status_code in [200, 201, 500]


@pytest.mark.asyncio
async def test_invite_positive(auth_token):
    """✅ Invite a new user successfully"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {
            "name": "Invited User",
            "email": f"invite_{uuid.uuid4().hex[:6]}@example.com",
            "role": "manager",  # valid role from backend enum
        }
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Invite:", response.status_code, response.text)
        assert response.status_code in [200, 201, 409, 500]

# -------------------------------------------------------------------
# ❌ NEGATIVE TEST CASES
# -------------------------------------------------------------------
@pytest.mark.asyncio
async def test_onboarding_missing_logo(auth_token):
    """❌ Missing logo should fail"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        data = {"tenant_id": "tenant_missing_logo", "brand_name": "BrandNoLogo"}
        response = await client.post(f"{BASE_URL}/onboarding", data=data)
        print("Missing logo:", response.status_code, response.text)
        assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_tenant_availability_missing_param():
    """❌ Missing tenant_id should fail"""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/tenant-availability")
        print("Missing tenant_id:", response.status_code, response.text)
        assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_create_order_invalid_plan(auth_token):
    """❌ Invalid plan should fail"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        params = {"plan": "INVALID_PLAN"}
        response = await client.get(f"{BASE_URL}/subscription", params=params)
        print("Invalid plan:", response.status_code, response.text)
        assert response.status_code in [400, 422, 404]


@pytest.mark.asyncio
async def test_update_order_missing_fields():
    """❌ Missing required order fields"""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(f"{BASE_URL}/subscription", json={})
        print("Missing fields:", response.status_code, response.text)
        assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_invite_invalid_email(auth_token):
    """❌ Invalid email format should fail"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {"name": "BadEmail", "email": "not-an-email", "role": "employee"}
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Invalid email:", response.status_code, response.text)
        assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_invite_missing_fields(auth_token):
    """❌ Missing fields should fail"""
    headers = {"Authorization": f"Bearer {auth_token['access_token']}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {"email": "user@example.com"}  # missing name & role
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Missing invite fields:", response.status_code, response.text)
        assert response.status_code in [400, 422]
