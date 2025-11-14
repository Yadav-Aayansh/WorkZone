import pytest
import httpx
import io
import uuid
import asyncio

# -------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------

TENANT_ID = "sandesh"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

# Test users
RECRUITER_EMAIL = "asmartboy9098@gmail.com" 
RECRUITER_PASSWORD = "test.com"          
TEST_EMAIL = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
TEST_PASSWORD = "StrongPass@123"
TEST_ROLE = "applicant"

# Dynamic data (captured during runtime)
APPLICANT_TOKEN = None
RECRUITER_TOKEN = None
APPLICATION_ID = None
JOB_ID = "job_abc123"

# -------------------------------------------------------------------
# 0️⃣ LOGIN (AUTH TOKENS)
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_signup_success():
    """✅ Positive: Tenant user signup."""
    await asyncio.sleep(3)  # Give DNS time if needed
    async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
        payload = {
            "name": "Test User",
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "role": TEST_ROLE,
        }
        response = await client.post(f"{BASE_URL}/auth/signup", json=payload)
        print("\nSignup Success Response:", response.text)
        assert response.status_code in [200, 201]

@pytest.mark.asyncio
async def test_login_applicant_and_recruiter():
    """✅ Log in both applicant and recruiter."""
    async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
        # Applicant login
        applicant_resp = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        print("\nApplicant Login Response:", applicant_resp.text)
        assert applicant_resp.status_code == 200
        global APPLICANT_TOKEN
        APPLICANT_TOKEN = applicant_resp.json().get("access_token")

        # Recruiter login
        recruiter_resp = await client.post(
            f"{BASE_URL}/auth/login",
            json={"email": RECRUITER_EMAIL, "password": RECRUITER_PASSWORD},
        )
        print("\nRecruiter Login Response:", recruiter_resp.text)
        assert recruiter_resp.status_code == 200
        global RECRUITER_TOKEN
        RECRUITER_TOKEN = recruiter_resp.json().get("access_token")


@pytest.mark.asyncio
async def test_login_invalid_user():
    """❌ Negative: Invalid login credentials."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": "fake@x.com", "password": "wrong123"})
        print("\nInvalid Login Response:", resp.text)
        assert resp.status_code == 401


# -------------------------------------------------------------------
# 1️⃣ APPLY TO JOB
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_to_job_success():
    """✅ Positive: Applicant applies to a job with resume upload."""
    if not APPLICANT_TOKEN:
        pytest.skip("Applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        resume_file = io.BytesIO(b"Fake resume PDF bytes")
        files = {"resume": ("resume.pdf", resume_file, "application/pdf")}
        response = await client.post(f"{BASE_URL}/jobs/{JOB_ID}/apply", headers=headers, files=files)
        print("\nApply Job Response:", response.text)
        assert response.status_code in [200, 201]
        global APPLICATION_ID
        APPLICATION_ID = response.json().get("id")


@pytest.mark.asyncio
async def test_apply_to_job_not_found():
    """❌ Negative: Applying to a non-existent job."""
    if not APPLICANT_TOKEN:
        pytest.skip("Applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        fake_job = "job_does_not_exist"
        resume_file = io.BytesIO(b"Fake resume data")
        files = {"resume": ("resume.pdf", resume_file, "application/pdf")}
        response = await client.post(f"{BASE_URL}/jobs/{fake_job}/apply", headers=headers, files=files)
        print("\nApply Nonexistent Job Response:", response.text)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_apply_to_job_unauthorized():
    """❌ Negative: Apply without token."""
    async with httpx.AsyncClient(verify=False) as client:
        resume_file = io.BytesIO(b"Fake resume data")
        files = {"resume": ("resume.pdf", resume_file, "application/pdf")}
        response = await client.post(f"{BASE_URL}/jobs/{JOB_ID}/apply", files=files)
        print("\nApply Unauthorized Response:", response.text)
        assert response.status_code in [401, 403]


# -------------------------------------------------------------------
# 2️⃣ LIST APPLICATIONS (RECRUITER)
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_applications_success():
    """✅ Positive: Recruiter views all applications for a job."""
    if not RECRUITER_TOKEN:
        pytest.skip("Recruiter token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {RECRUITER_TOKEN}"}
        response = await client.get(f"{BASE_URL}/jobs/{JOB_ID}/applications", headers=headers)
        print("\nList Applications Response:", response.text)
        assert response.status_code == 200
        assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_list_applications_unauthorized_role():
    """❌ Negative: Applicant trying to list job applications."""
    if not APPLICANT_TOKEN:
        pytest.skip("Applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        response = await client.get(f"{BASE_URL}/jobs/{JOB_ID}/applications", headers=headers)
        print("\nUnauthorized List Applications Response:", response.text)
        assert response.status_code == 403


# -------------------------------------------------------------------
# 3️⃣ GET APPLICATION DETAILS
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_application_success():
    """✅ Positive: Applicant retrieves their own application."""
    if not APPLICATION_ID or not APPLICANT_TOKEN:
        pytest.skip("Application or applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        response = await client.get(f"{BASE_URL}/applications/{APPLICATION_ID}", headers=headers)
        print("\nGet Application Response:", response.text)
        assert response.status_code == 200
        assert response.json()["id"] == APPLICATION_ID


@pytest.mark.asyncio
async def test_get_application_not_found():
    """❌ Negative: Non-existent application."""
    if not APPLICANT_TOKEN:
        pytest.skip("Applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        response = await client.get(f"{BASE_URL}/applications/app_does_not_exist", headers=headers)
        print("\nGet Nonexistent Application Response:", response.text)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_application_unauthorized_access():
    """❌ Negative: Applicant trying to access someone else's application."""
    if not RECRUITER_TOKEN:
        pytest.skip("Recruiter token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        # Assuming the recruiter is not allowed to view this applicant’s private data
        headers = {"Authorization": f"Bearer {RECRUITER_TOKEN}"}
        fake_app_id = "app_fake_unauthorized"
        response = await client.get(f"{BASE_URL}/applications/{fake_app_id}", headers=headers)
        print("\nUnauthorized Get Application Response:", response.text)
        assert response.status_code in [403, 404]


# -------------------------------------------------------------------
# 4️⃣ WITHDRAW APPLICATION
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_withdraw_application_success():
    """✅ Positive: Applicant withdraws application."""
    if not APPLICATION_ID or not APPLICANT_TOKEN:
        pytest.skip("Application or token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        response = await client.delete(f"{BASE_URL}/applications/{APPLICATION_ID}/withdraw", headers=headers)
        print("\nWithdraw Application Response:", response.text)
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_withdraw_application_not_found():
    """❌ Negative: Withdraw non-existent application."""
    if not APPLICANT_TOKEN:
        pytest.skip("Applicant token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {APPLICANT_TOKEN}"}
        response = await client.delete(f"{BASE_URL}/applications/fake_app_999/withdraw", headers=headers)
        print("\nWithdraw Nonexistent Application Response:", response.text)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_withdraw_application_unauthorized():
    """❌ Negative: Withdraw without token."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.delete(f"{BASE_URL}/applications/fake_app_999/withdraw")
        print("\nWithdraw Unauthorized Response:", response.text)
        assert response.status_code in [401, 403]
