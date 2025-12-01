import io
import uuid
import pytest
import httpx
import asyncio

# Global Config

BASE_PLATFORM_URL = "https://workzone.tech/api"
CLIENT_BASE_URL = f"{BASE_PLATFORM_URL}/platform"

TENANT_ID = "abc123"
TENANT_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant/auth"

# Credentials
CLIENT_EMAIL = f"platformadmin@workzone.tech"
CLIENT_PASSWORD = "Admin@123"

# Test Data
BRAND_NAME = f"MyBrand_{uuid.uuid4().hex[:4]}"
LOGO_FILE_CONTENT = b"fake image bytes"
TEST_EMAIL = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
TEST_PASSWORD = "StrongPass@123"
TEST_ROLE = "applicant"

# Dynamic Storage
CLIENT_ACCESS_TOKEN = None
REFRESH_TOKEN = None

# Signup Tests

@pytest.mark.asyncio
async def test_signup_success():
    """Test tenant user signup."""
    await asyncio.sleep(3)  # Give DNS time if needed
    async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
        payload = {
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "role": TEST_ROLE,
        }
        response = await client.post(f"{TENANT_URL}/signup", json=payload)
        print("\nSignup Success Response:", response.text)
        assert response.status_code in [200, 201]


@pytest.mark.asyncio
async def test_signup_duplicate_user():
    """Test duplicate user signup."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "role": TEST_ROLE,
        }
        response = await client.post(f"{TENANT_URL}/signup", json=payload)
        print("\nDuplicate Signup Response:", response.text)
        assert response.status_code == 403 or "exists" in response.text.lower()


@pytest.mark.asyncio
async def test_signup_missing_fields():
    """Test signup with missing fields."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"name": "NoEmail", "password": TEST_PASSWORD, "role": TEST_ROLE}
        response = await client.post(f"{TENANT_URL}/signup", json=payload)
        print("\nSignup Missing Fields Response:", response.text)
        assert response.status_code == 422


# Login Tests

@pytest.mark.asyncio
async def test_login_success():
    """Test login to tenant."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        response = await client.post(f"{TENANT_URL}/login", json=payload)
        print("\nLogin Success Response:", response.text)
        assert response.status_code == 200

        data = response.json()
        global REFRESH_TOKEN
        REFRESH_TOKEN = data.get("refresh_token")
        assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password():
    """Test login with wrong password."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"email": TEST_EMAIL, "password": "WrongPassword!"}
        response = await client.post(f"{TENANT_URL}/login", json=payload)
        print("\nLogin Wrong Password Response:", response.text)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_user():
    """Test login with unknown user."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"email": "nouser@unknown.com", "password": "InvalidPass"}
        response = await client.post(f"{TENANT_URL}/login", json=payload)
        print("\nLogin Unknown User Response:", response.text)
        assert response.status_code == 401


# Refresh Token Tests

@pytest.mark.asyncio
async def test_refresh_token_success():
    """Test refresh access token."""
    if not REFRESH_TOKEN:
        pytest.skip("No refresh token from login.")
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            f"{TENANT_URL}/refresh",
            json={"refresh_token": REFRESH_TOKEN},
        )
        print("\nRefresh Token Success Response:", response.text)
        assert response.status_code == 200
        assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_refresh_token_invalid():
    """Test invalid refresh token."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(
            f"{TENANT_URL}/refresh",
            json={"refresh_token": "invalid.token.value"},
        )
        print("\nInvalid Refresh Token Response:", response.text)
        assert response.status_code in [400, 401, 500]