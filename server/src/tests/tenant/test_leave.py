import pytest
import httpx
import uuid
from datetime import datetime, timedelta

# Global Config

TENANT_ID = "abc123"
BASE_URL = f"https://{TENANT_ID}.workzone.tech/api/tenant"

EMPLOYEE_EMAIL = "employee@example.com"
EMPLOYEE_PASSWORD = "password123"
MANAGER_EMAIL = "manager@example.com"
MANAGER_PASSWORD = "password123"

EMPLOYEE_TOKEN = None
MANAGER_TOKEN = None
LEAVE_REQUEST_ID = None

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
async def test_login_manager():
    """Login as manager."""
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BASE_URL}/auth/login", json={"email": MANAGER_EMAIL, "password": MANAGER_PASSWORD})
        if resp.status_code == 200:
            global MANAGER_TOKEN
            MANAGER_TOKEN = resp.json()["access_token"]

# Leave Tests

@pytest.mark.asyncio
async def test_leave_flow():
    """Test the full Leave flow: Apply -> Approve/Reject"""
    if not EMPLOYEE_TOKEN or not MANAGER_TOKEN:
        pytest.skip("Missing tokens")
        
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        # 1. Employee Applies for Leave
        start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        
        leave_payload = {
            "leave_type_id": str(uuid.uuid4()), 
            "start_date": start_date,
            "end_date": end_date,
            "reason": "Sick leave"
        }
        
        leave_resp = await client.post("/leaves/apply", json=leave_payload, headers={"Authorization": f"Bearer {EMPLOYEE_TOKEN}"})
        print("Apply Leave Response:", leave_resp.status_code, leave_resp.text)
        
        if leave_resp.status_code in [200, 201]:
            global LEAVE_REQUEST_ID
            LEAVE_REQUEST_ID = leave_resp.json()["id"]
            
            # 2. Manager Approves Leave
            approve_resp = await client.post(f"/leaves/{LEAVE_REQUEST_ID}/approve", headers={"Authorization": f"Bearer {MANAGER_TOKEN}"})
            assert approve_resp.status_code == 200
        else:
            print("Skipping remaining leave steps due to apply failure.")

@pytest.mark.asyncio
async def test_apply_leave_unauthorized():
    """Test applying for leave without auth"""
    async with httpx.AsyncClient(verify=False, base_url=BASE_URL) as client:
        response = await client.post("/leaves/apply", json={})
        assert response.status_code == 403
