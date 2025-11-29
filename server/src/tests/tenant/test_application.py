import pytest
import httpx
import uuid

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

RECRUITER_EMAIL = "recruiter@example.com"
RECRUITER_PASSWORD = "password123"
APPLICANT_EMAIL = "applicant@example.com"
APPLICANT_PASSWORD = "password123"

RECRUITER_TOKEN = None
APPLICANT_TOKEN = None
JOB_ID = None

# Setup (Login)

@pytest.mark.asyncio
async def test_login_recruiter():
    """Login as recruiter."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": RECRUITER_EMAIL, "password": RECRUITER_PASSWORD})
        if resp.status_code == 200:
            global RECRUITER_TOKEN
            RECRUITER_TOKEN = resp.json()["access_token"]

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

# Application Tests

@pytest.mark.asyncio
async def test_apply_for_job():
    """Test applying for a job (Applicant)"""
    if not RECRUITER_TOKEN or not APPLICANT_TOKEN:
        pytest.skip("Missing tokens")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        # 1. Create Job (Recruiter)
        job_resp = await client.post("/jobs/", json={
            "title": "Application Job", "description": "Desc", "department": "IT", "location": "Remote"
        }, headers={"Authorization": f"Bearer {RECRUITER_TOKEN}"})
        global JOB_ID
        JOB_ID = job_resp.json()["id"]
        
        # 2. Apply (Applicant)
        files = {'resume': ('resume.pdf', b'fake-pdf-content', 'application/pdf')}
        apply_resp = await client.post(f"/jobs/{JOB_ID}/apply", files=files, headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        print("Apply Response:", apply_resp.status_code, apply_resp.text)
        assert apply_resp.status_code in [200, 201]
        assert "id" in apply_resp.json()

@pytest.mark.asyncio
async def test_list_my_applications():
    """Test listing applicant's own applications"""
    if not APPLICANT_TOKEN:
        pytest.skip("No applicant token")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get("/applicant/applications", headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        print("List My Apps:", response.status_code)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_recruiter_list_applications():
    """Test recruiter listing applications for a job"""
    if not RECRUITER_TOKEN or not JOB_ID:
        pytest.skip("Missing token or job")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.get(f"/jobs/{JOB_ID}/applications", headers={"Authorization": f"Bearer {RECRUITER_TOKEN}"})
        print("Recruiter List Apps:", response.status_code)
        assert response.status_code == 200
        assert len(response.json()) > 0

# Negative Test Cases

@pytest.mark.asyncio
async def test_apply_no_auth():
    """Test applying without token"""
    if not JOB_ID:
        pytest.skip("No job id")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.post(f"/jobs/{JOB_ID}/apply", files={'resume': ('r.pdf', b'c', 'pdf')})
        print("No Auth Apply:", response.status_code)
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_apply_non_existent_job():
    """Test applying to unknown job"""
    if not APPLICANT_TOKEN:
        pytest.skip("No applicant token")
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.post(f"/jobs/{uuid.uuid4()}/apply", files={'resume': ('r.pdf', b'c', 'pdf')}, headers={"Authorization": f"Bearer {APPLICANT_TOKEN}"})
        print("Apply Unknown Job:", response.status_code)
        assert response.status_code == 404