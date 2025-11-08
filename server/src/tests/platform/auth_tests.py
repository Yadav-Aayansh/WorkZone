import pytest
import httpx
import uuid

# -------------------------------
# Base configuration
# -------------------------------
BASE_URL = "https://workzone.tech/api/platform/auth"

# Create a random email each run to avoid signup conflicts
UNIQUE_EMAIL = f"user_{uuid.uuid4().hex[:6]}@example.com"
VALID_PASSWORD = "$Raghav123"
VALID_NAME = "Raghav TestUser"


# -------------------------------
# ✅ Positive Test Cases
# -------------------------------

@pytest.mark.asyncio
async def test_signup_positive():
    """✅ Test successful signup with valid data"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "name": VALID_NAME,
            "email": UNIQUE_EMAIL,
            "password": VALID_PASSWORD
        }
        response = await client.post(f"{BASE_URL}/signup", json=payload)
        print("Signup response:", response.status_code, response.text)

        assert response.status_code in [201, 409]  # 201 if new, 409 if already exists
        if response.status_code == 201:
            data = response.json()
            assert all(k in data for k in [
                "access_token", "refresh_token", "account_status", "subscription_status"
            ])


@pytest.mark.asyncio
async def test_login_positive():
    """✅ Test successful login with correct credentials"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "email": "raghav@gmail.com",  # existing test user
            "password": "$Raghav123"
        }
        response = await client.post(f"{BASE_URL}/login", json=payload)
        print("Login response:", response.status_code, response.text)

        assert response.status_code == 200
        data = response.json()
        assert all(k in data for k in [
            "access_token", "refresh_token", "account_status", "subscription_status"
        ])
        return data


@pytest.mark.asyncio
async def test_refresh_token_positive():
    """✅ Test token refresh with valid refresh token"""
    async with httpx.AsyncClient(verify=False) as client:
        # First, login to get refresh token
        login_resp = await client.post(
            f"{BASE_URL}/login",
            json={"email": "raghav@gmail.com", "password": "$Raghav123"}
        )
        assert login_resp.status_code == 200
        refresh_token = login_resp.json()["refresh_token"]

        # Use refresh token
        response = await client.post(f"{BASE_URL}/refresh", json={"refresh_token": refresh_token})
        print("Refresh response:", response.status_code, response.text)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data


# -------------------------------
# ❌ Negative Test Cases
# -------------------------------

@pytest.mark.asyncio
async def test_signup_with_invalid_email():
    """❌ Test signup with invalid email format"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "name": VALID_NAME,
            "email": "not-an-email",
            "password": VALID_PASSWORD
        }
        response = await client.post(f"{BASE_URL}/signup", json=payload)
        print("Invalid email signup:", response.status_code, response.text)
        assert response.status_code in [400, 422]  # FastAPI validation error


@pytest.mark.asyncio
async def test_signup_with_weak_password():
    """❌ Test signup with too short password"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "name": VALID_NAME,
            "email": f"user_{uuid.uuid4().hex[:6]}@example.com",
            "password": "123"  # too short
        }
        response = await client.post(f"{BASE_URL}/signup", json=payload)
        print("Weak password signup:", response.status_code, response.text)
        assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_login_with_wrong_password():
    """❌ Test login with incorrect password"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "email": "raghav@gmail.com",
            "password": "WrongPass123"
        }
        response = await client.post(f"{BASE_URL}/login", json=payload)
        print("Wrong password login:", response.status_code, response.text)
        assert response.status_code in [401, 404]


@pytest.mark.asyncio
async def test_login_with_nonexistent_user():
    """❌ Test login with non-existing user"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "email": "nonexistent@example.com",
            "password": "SomePass123"
        }
        response = await client.post(f"{BASE_URL}/login", json=payload)
        print("Nonexistent user login:", response.status_code, response.text)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_refresh_token_with_invalid_token():
    """❌ Test refresh with invalid token"""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"refresh_token": "invalid.token.value"}
        response = await client.post(f"{BASE_URL}/refresh", json=payload)
        print("Invalid refresh token:", response.status_code, response.text)
        assert response.status_code in [401, 400, 500]


@pytest.mark.asyncio
async def test_refresh_token_missing_field():
    """❌ Test refresh request missing refresh_token field"""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.post(f"{BASE_URL}/refresh", json={})
        print("Missing field refresh:", response.status_code, response.text)
        assert response.status_code in [400, 422]
