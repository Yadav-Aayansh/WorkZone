import pytest
import httpx
import uuid
import asyncio

# -------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------

TENANT_ID = "sandesh"  # ⚠️ Replace with your actual tenant_id
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

RECRUITER_EMAIL = "asmartboy9098@gmail.com" 
RECRUITER_PASSWORD = "test.com"          

# Dynamic values filled during test flow
ACCESS_TOKEN = None
JOB_ID = None

# -------------------------------------------------------------------
# 0️⃣ LOGIN (GET AUTH TOKEN)
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_login_recruiter_success():
    """✅ Login recruiter to get token."""
    async with httpx.AsyncClient(verify=False, timeout=30.0) as client:
        payload = {
            "email": RECRUITER_EMAIL,
            "password": RECRUITER_PASSWORD,
        }
        response = await client.post(f"{BASE_URL}/auth/login", json=payload)
        print("\nRecruiter Login Response:", response.text)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        global ACCESS_TOKEN
        ACCESS_TOKEN = data.get("access_token")
        assert ACCESS_TOKEN


@pytest.mark.asyncio
async def test_login_invalid_credentials():
    """❌ Negative: Invalid recruiter login."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "email": RECRUITER_EMAIL,
            "password": "WrongPassword",
        }
        response = await client.post(f"{BASE_URL}/auth/login", json=payload)
        print("\nInvalid Login Response:", response.text)
        assert response.status_code == 401


# -------------------------------------------------------------------
# 1️⃣ CREATE JOB
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_job_success():
    """✅ Positive: Successfully create a job."""
    if not ACCESS_TOKEN:
        pytest.skip("No access token from recruiter login.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        payload = {
            "title": f"Software Engineer {uuid.uuid4().hex[:4]}",
            "department": "Engineering",
            "location": "Remote",
            "description": "Develop backend microservices.",
        }
        response = await client.post(f"{BASE_URL}/jobs", json=payload, headers=headers)
        print("\nCreate Job Response:", response.text)
        assert response.status_code in [200, 201]
        data = response.json()
        global JOB_ID
        JOB_ID = data.get("id")
        assert JOB_ID


@pytest.mark.asyncio
async def test_create_job_unauthorized():
    """❌ Negative: Create job without token."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {
            "title": "Unauthorized Job",
            "department": "IT",
            "location": "Remote",
            "description": "Should fail.",
        }
        response = await client.post(f"{BASE_URL}/jobs", json=payload)
        print("\nUnauthorized Create Job Response:", response.text)
        assert response.status_code in [401, 403]


# -------------------------------------------------------------------
# 2️⃣ LIST JOBS
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_jobs_success():
    """✅ Positive: List all jobs."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/jobs")
        print("\nList Jobs Response:", response.text)
        assert response.status_code == 200
        jobs = response.json()
        assert isinstance(jobs, list)


@pytest.mark.asyncio
async def test_list_jobs_invalid_params():
    """❌ Negative: List jobs with invalid query param."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/jobs?limit=invalidd")
        print("\nInvalid Params List Jobs:", response.text)
        assert response.status_code in [200, 204]


# -------------------------------------------------------------------
# 3️⃣ GET JOB
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_job_success():
    """✅ Positive: Get created job by ID."""
    if not JOB_ID:
        pytest.skip("Job not created yet.")
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/jobs/{JOB_ID}")
        print("\nGet Job Response:", response.text)
        assert response.status_code == 200
        assert response.json()["id"] == JOB_ID


@pytest.mark.asyncio
async def test_get_job_not_found():
    """❌ Negative: Get non-existent job."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(f"{BASE_URL}/jobs/{-1234567890}")
        print("\nGet Job Not Found Response:", response.text)
        assert response.status_code in [404, 500]


# -------------------------------------------------------------------
# 4️⃣ UPDATE JOB
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_update_job_success():
    """✅ Positive: Update job details."""
    if not JOB_ID or not ACCESS_TOKEN:
        pytest.skip("Job ID or token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        payload = {"description": "Updated job description."}
        response = await client.patch(f"{BASE_URL}/jobs/{JOB_ID}", json=payload, headers=headers)
        print("\nUpdate Job Response:", response.text)
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_update_job_not_found():
    """❌ Negative: Update non-existent job."""
    if not ACCESS_TOKEN:
        pytest.skip("Token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        payload = {"description": "New desc"}
        response = await client.patch(f"{BASE_URL}/jobs/job_doesnt_exist", json=payload, headers=headers)
        print("\nUpdate Job Not Found Response:", response.text)
        assert response.status_code in [404, 500]


@pytest.mark.asyncio
async def test_update_job_unauthorized_role():
    """❌ Negative: Unauthorized role (no token)."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {"description": "No token update"}
        response = await client.patch(f"{BASE_URL}/jobs/{JOB_ID or 'fake_id'}", json=payload)
        print("\nUnauthorized Update Response:", response.text)
        assert response.status_code in [401, 403]


# -------------------------------------------------------------------
# 5️⃣ DELETE JOB
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_delete_job_success():
    """✅ Positive: Delete created job."""
    if not JOB_ID or not ACCESS_TOKEN:
        pytest.skip("Job ID or token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        response = await client.delete(f"{BASE_URL}/jobs/{JOB_ID}", headers=headers)
        print("\nDelete Job Response:", response.text)
        assert response.status_code in [200, 204]


@pytest.mark.asyncio
async def test_delete_job_not_found():
    """❌ Negative: Try to delete non-existent job."""
    if not ACCESS_TOKEN:
        pytest.skip("Token missing.")
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
        response = await client.delete(f"{BASE_URL}/jobs/invalid_id_123", headers=headers)
        print("\nDelete Job Not Found Response:", response.text)
        assert response.status_code in [404, 500]


@pytest.mark.asyncio
async def test_delete_job_unauthorized():
    """❌ Negative: Delete without token."""
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.delete(f"{BASE_URL}/jobs/{JOB_ID or 'fake_id'}")
        print("\nUnauthorized Delete Job Response:", response.text)
        assert response.status_code in [401, 403]


# -------------------------------------------------------------------
# 6️⃣ AI JOB DESCRIPTION ENHANCER
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_ai_enhancer_invalid_payload():
    """❌ Negative: Missing prompt."""
    async with httpx.AsyncClient(verify=False) as client:
        payload = {}
        response = await client.post(f"{BASE_URL}/jobs/ai/enhance-description", json=payload)
        print("\nAI Enhancer Invalid Payload Response:", response.text)
        assert response.status_code == 422
