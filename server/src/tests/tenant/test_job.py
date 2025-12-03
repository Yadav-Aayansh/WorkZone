import pytest
import httpx
import uuid
import asyncio

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

# Credentials
RECRUITER_EMAIL = "recruiter@example.com"
RECRUITER_PASSWORD = "password123"
APPLICANT_EMAIL = "applicant@example.com"
APPLICANT_PASSWORD = "password123"

# Dynamic storage
RECRUITER_TOKEN = None
APPLICANT_TOKEN = None
JOB_ID = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_recruiter():
    """Login as recruiter to get token."""
    async with httpx.AsyncClient(verify=False) as client:
        # Try login
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": RECRUITER_EMAIL, "password": RECRUITER_PASSWORD})
        
        if resp.status_code == 200:
            global RECRUITER_TOKEN
            RECRUITER_TOKEN = resp.json()["access_token"]
            assert RECRUITER_TOKEN
        else:
            pytest.skip(f"Could not login as recruiter: {resp.status_code}")

@pytest.mark.asyncio
async def test_login_applicant():
    """Login as applicant to get token."""
    async with httpx.AsyncClient(verify=False) as client:
        # Try signup first
        await client.post(f"{BASE_URL}/auth/signup", json={
            "name": "Test Applicant",
            "email": APPLICANT_EMAIL,
            "password": APPLICANT_PASSWORD,
            "role": "applicant"
        })
        
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": APPLICANT_EMAIL, "password": APPLICANT_PASSWORD})
        if resp.status_code == 200:
            global APPLICANT_TOKEN
            APPLICANT_TOKEN = resp.json()["access_token"]
            assert APPLICANT_TOKEN
        else:
            pytest.skip(f"Could not login as applicant: {resp.status_code}")

# Job Tests

@pytest.mark.asyncio
async def test_create_job():
    """Test creating a job (Recruiter)"""
    if not RECRUITER_TOKEN:
        pytest.skip("No recruiter token")
        
    headers = {"Authorization": f"Bearer {RECRUITER_TOKEN}"}
    
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        payload = {
            "title": f"Software Engineer {uuid.uuid4().hex[:4]}",
            "department": "Engineering",
            "location": "Remote",
            "description": "We are looking for a great engineer.",
            "type": "Full-time",
            "experience_level": "Senior",
            "salary_range": "$100k - $150k",
            "skills": ["Python", "React"]
        }
        response = await client.post("/jobs/", json=payload, headers=headers)
        print("Create Job Response:", response.status_code, response.text)
        assert response.status_code in [200, 201]
        global JOB_ID
        JOB_ID = response.json()["id"]
        assert JOB_ID

@pytest.mark.asyncio
async def test_list_jobs():
    """Test listing jobs (Public or Authenticated)"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/jobs/")
        print("List Jobs Response:", response.status_code)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_job_details():
    """Test getting job details"""
    if not JOB_ID:
        pytest.skip("No job created")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get(f"/jobs/{JOB_ID}")
        print("Get Job Response:", response.status_code)
        assert response.status_code == 200
        assert response.json()["id"] == JOB_ID

@pytest.mark.asyncio
async def test_update_job():
    """Test updating a job (Recruiter)"""
    if not RECRUITER_TOKEN or not JOB_ID:
        pytest.skip("No recruiter token or job")
        
    headers = {"Authorization": f"Bearer {RECRUITER_TOKEN}"}
    
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.patch(f"/jobs/{JOB_ID}", json={"title": "Updated Title"}, headers=headers)
        print("Update Job Response:", response.status_code)
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"

@pytest.mark.asyncio
async def test_close_job():
    """Test closing a job (Recruiter)"""
    if not RECRUITER_TOKEN or not JOB_ID:
        pytest.skip("No recruiter token or job")
        
    headers = {"Authorization": f"Bearer {RECRUITER_TOKEN}"}
    
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.delete(f"/jobs/{JOB_ID}", headers=headers)
        print("Delete/Close Job Response:", response.status_code)
        assert response.status_code in [200, 204]

# Negative Test Cases

@pytest.mark.asyncio
async def test_create_job_unauthorized():
    """Test creating job without token"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.post("/jobs/", json={"title": "No Auth"})
        print("Unauthorized Create Job:", response.status_code)
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_update_job_wrong_role():
    """Test updating job as Applicant"""
    if not APPLICANT_TOKEN or not JOB_ID:
        pytest.skip("No applicant token or job")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.patch(f"/jobs/{JOB_ID}", json={"title": "Hacked"}, headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        print("Wrong Role Update:", response.status_code)
        assert response.status_code == 403

@pytest.mark.asyncio
async def test_get_non_existent_job():
    """Test getting unknown job"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get(f"/jobs/{uuid.uuid4()}")
        print("Get Unknown Job:", response.status_code)
        assert response.status_code == 404
