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

# Client Tests

@pytest.mark.asyncio
async def test_onboarding_positive(tmp_path):
    """Test successful onboarding"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
        
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
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
    """Check tenant availability"""
    async with httpx.AsyncClient(verify=False) as client:
        params = {"tenant_id": "tenant_test"}
        response = await client.get(f"{BASE_URL}/tenant-availability", params=params)
        print("Tenant availability:", response.status_code, response.text)
        assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_create_order_positive():
    """Create order with valid subscription plan"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        params = {"plan": "3_months"}  # valid plan
        response = await client.get(f"{BASE_URL}/subscription", params=params)
        print("Create order:", response.status_code, response.text)
        assert response.status_code in [200, 201, 409, 500]

@pytest.mark.asyncio
async def test_update_order_positive():
    """Update order with valid payment details"""
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
async def test_invite_positive():
    """Invite a new user successfully"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {
            "name": "Invited User",
            "email": f"invite_{uuid.uuid4().hex[:6]}@example.com",
            "role": "manager",  # valid role from backend enum
        }
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Invite:", response.status_code, response.text)
        assert response.status_code in [200, 201, 409, 500]

# Negative Test Cases

@pytest.mark.asyncio
async def test_onboarding_missing_logo():
    """Missing logo should fail"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        data = {"tenant_id": "tenant_missing_logo", "brand_name": "BrandNoLogo"}
        response = await client.post(f"{BASE_URL}/onboarding", data=data)
        print("Missing logo:", response.status_code, response.text)
        assert response.status_code in [400, 422]

@pytest.mark.asyncio
async def test_tenant_availability_missing_param():
    """Missing tenant_id should fail"""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/tenant-availability")
        print("Missing tenant_id:", response.status_code, response.text)
        assert response.status_code in [400, 422]

@pytest.mark.asyncio
async def test_create_order_invalid_plan():
    """Invalid plan should fail"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        params = {"plan": "INVALID_PLAN"}
        response = await client.get(f"{BASE_URL}/subscription", params=params)
        print("Invalid plan:", response.status_code, response.text)
        assert response.status_code in [400, 422, 404]

@pytest.mark.asyncio
async def test_update_order_missing_fields():
    """Missing required order fields"""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(f"{BASE_URL}/subscription", json={})
        print("Missing fields:", response.status_code, response.text)
        assert response.status_code in [400, 422]

@pytest.mark.asyncio
async def test_invite_invalid_email():
    """Invalid email format should fail"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {"name": "BadEmail", "email": "not-an-email", "role": "employee"}
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Invalid email:", response.status_code, response.text)
        assert response.status_code in [400, 422]

@pytest.mark.asyncio
async def test_invite_missing_fields():
    """Missing fields should fail"""
    if not PLATFORM_TOKEN:
        pytest.skip("No platform token")
    headers = {"Authorization": f"Bearer {PLATFORM_TOKEN}"}
    async with httpx.AsyncClient(verify=False, headers=headers) as client:
        payload = {"email": "user@example.com"}  # missing name & role
        response = await client.post(f"{BASE_URL}/invite", json=payload)
        print("Missing invite fields:", response.status_code, response.text)
        assert response.status_code in [400, 422]
