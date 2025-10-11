# 🐛 Code Issues & Fixes

## Priority Ranking

| Priority | Issue | File | Line | Impact | Fix Time |
|----------|-------|------|------|--------|----------|
| 🔴 P0 | SQL Injection | `database.py` | 29 | Critical Security Risk | 5 min |
| 🔴 P0 | No Tests | N/A | N/A | Zero Quality Assurance | 1-2 days |
| 🟡 P1 | Debug Print | `security.py` | 33 | Production Code Smell | 2 min |
| 🟡 P1 | Broken Error Msg | `client.py` | 82 | Poor UX | 1 min |
| 🟡 P1 | No Documentation | All files | N/A | Maintainability | 2-3 days |
| 🟢 P2 | Typo in Variable | `database.py` | 23 | Code Quality | 1 min |
| 🟢 P2 | Commented Code | `auth.py` | 43-47 | Code Cleanliness | 1 min |
| 🟢 P2 | Magic Numbers | `security.py` | 7, 14 | Configuration | 10 min |

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### Issue #1: SQL Injection Vulnerability
**File:** `src/core/database.py:29`  
**Severity:** 🔴 Critical  
**Type:** Security  

#### Current Code:
```python
async def get_tenant_db(tenant_id: str) -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text(f"SET search_path TO {tenant_id}"))  # ❌ VULNERABLE
            yield session
```

#### Problem:
Using f-string interpolation with SQL queries allows SQL injection. An attacker could pass:
```python
tenant_id = "public; DROP SCHEMA public CASCADE; --"
```

#### Fix:
```python
async def get_tenant_db(tenant_id: str) -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            # ✅ Use parameterized query
            await session.execute(
                text("SET search_path TO :tenant_id"), 
                {"tenant_id": tenant_id}
            )
            yield session
```

#### Additional Protection:
```python
import re

async def get_tenant_db(tenant_id: str) -> AsyncSession:
    # Validate tenant_id format (alphanumeric + underscore only)
    if not re.match(r'^[a-zA-Z0-9_]+$', tenant_id):
        raise ValueError(f"Invalid tenant_id format: {tenant_id}")
    
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(
                text("SET search_path TO :tenant_id"), 
                {"tenant_id": tenant_id}
            )
            yield session
```

---

### Issue #2: No Test Coverage
**Files:** Entire codebase  
**Severity:** 🔴 Critical  
**Type:** Quality Assurance  

#### Problem:
```bash
$ find . -type f -name "*test*.py" | wc -l
0
```
Zero tests = no safety net for refactoring or new features.

#### Fix:
Create test structure:

```bash
server/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_core/
│   │   ├── test_security.py
│   │   └── test_database.py
│   ├── test_services/
│   │   └── test_client_service.py
│   ├── test_repositories/
│   │   └── test_client_repository.py
│   └── test_routes/
│       └── test_auth.py
```

#### Example Test:
```python
# tests/test_core/test_security.py
import pytest
from src.core.security import create_access_token, decode_token
from jose import jwt

def test_create_access_token():
    payload = {"sub": "user123", "email": "test@test.com", "aud": "test.com"}
    token = create_access_token(payload)
    
    assert token is not None
    assert isinstance(token, str)
    
    # Verify token can be decoded
    decoded = jwt.decode(token, options={"verify_signature": False})
    assert decoded["sub"] == "user123"
    assert decoded["type"] == "access"

def test_token_expiration():
    # Test that tokens expire correctly
    pass

def test_refresh_token_has_jti():
    # Test refresh token includes jti
    pass
```

#### Update pyproject.toml:
```toml
[project.optional-dependencies]
test = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.25.0",  # For testing FastAPI
]
```

---

## 🟡 HIGH PRIORITY ISSUES

### Issue #3: Debug Print Statement
**File:** `src/core/security.py:33`  
**Severity:** 🟡 High  
**Type:** Production Anti-pattern  

#### Current Code:
```python
def decode_token(token: str, exp_aud: str, exp_type: str = "access") -> dict:
    try:
        print(exp_aud)  # ❌ Debug print
        payload = jwt.decode(...)
```

#### Fix:
```python
from src.core.logger import logger

def decode_token(token: str, exp_aud: str, exp_type: str = "access") -> dict:
    """Decode and validate JWT token.
    
    Args:
        token: JWT token string
        exp_aud: Expected audience claim
        exp_type: Expected token type (access/refresh)
        
    Returns:
        dict: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        logger.debug(f"Decoding token for audience: {exp_aud}")  # ✅ Proper logging
        payload = jwt.decode(...)
```

---

### Issue #4: Broken Error Message
**File:** `src/services/platform/client.py:82`  
**Severity:** 🟡 High  
**Type:** Bug  

#### Current Code:
```python
async def login(self, data: ClientLoginRequest):
    client = await self.client_repo.get_client_by_email(data.email)
    if not client:
        raise ClientNotFoundError("Client {data.email} does not exist!")  # ❌ Not interpolated
```

#### Fix:
```python
async def login(self, data: ClientLoginRequest):
    client = await self.client_repo.get_client_by_email(data.email)
    if not client:
        raise ClientNotFoundError(f"Client {data.email} does not exist!")  # ✅ f-string
```

---

### Issue #5: Missing Input Validation
**File:** `src/schemas/platform/client.py`  
**Severity:** 🟡 High  
**Type:** Security & Data Integrity  

#### Current Code:
```python
class ClientOnboarding(BaseModel):
    tenant_id: str = Field(..., max_length=50)  # ❌ No pattern validation
    brand_name: str = Field(..., max_length=100)
```

#### Fix:
```python
from pydantic import BaseModel, Field, validator
import re

class ClientOnboarding(BaseModel):
    tenant_id: str = Field(
        ..., 
        max_length=50,
        pattern=r'^[a-zA-Z0-9_]+$',  # ✅ Alphanumeric + underscore only
        description="Unique tenant identifier (alphanumeric and underscore only)"
    )
    brand_name: str = Field(
        ..., 
        min_length=1,
        max_length=100,
        description="Brand display name"
    )
    
    @validator('tenant_id')
    def validate_tenant_id(cls, v):
        if v.lower() in ['public', 'information_schema', 'pg_catalog']:
            raise ValueError('Reserved schema name not allowed')
        if not re.match(r'^[a-z][a-z0-9_]*$', v):
            raise ValueError('Must start with letter, contain only lowercase letters, numbers, and underscores')
        return v.lower()  # Normalize to lowercase
```

---

### Issue #6: Too Broad Exception Handling
**File:** `src/repository/platform/client.py:28-30, 47-49`  
**Severity:** 🟡 High  
**Type:** Error Handling  

#### Current Code:
```python
async def create_client(self, name: str, email: str, password: str) -> Client:
    try:
        new_client = Client(...)
        self.db.add(new_client)
        await self.db.commit()
        return new_client
    except Exception:  # ❌ Too broad
        await self.db.rollback()
        raise
```

#### Fix:
```python
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from src.core.logger import logger

async def create_client(self, name: str, email: str, password: str) -> Client:
    try:
        new_client = Client(
            name=name,
            email=email,
            password=password
        )
        self.db.add(new_client)
        await self.db.commit()
        await self.db.refresh(new_client)
        return new_client
    except IntegrityError as e:
        await self.db.rollback()
        logger.error(f"Integrity error creating client: {e}")
        # Check if it's email uniqueness violation
        if "email" in str(e.orig):
            raise ClientAlreadyExistsError(f"Email {email} already exists")
        raise
    except SQLAlchemyError as e:
        await self.db.rollback()
        logger.error(f"Database error creating client: {e}")
        raise
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### Issue #7: Variable Name Typo
**File:** `src/core/database.py:23-24`  
**Severity:** 🟢 Medium  
**Type:** Code Quality  

#### Current Code:
```python
async def get_public_db() -> AsyncSession:
    async for sesion in get_tenant_db("public"):  # ❌ Typo: "sesion"
        yield sesion
```

#### Fix:
```python
async def get_public_db() -> AsyncSession:
    async for session in get_tenant_db("public"):  # ✅ Correct spelling
        yield session
```

---

### Issue #8: Commented Out Code
**File:** `src/routes/platform/auth.py:43-47`  
**Severity:** 🟢 Medium  
**Type:** Code Cleanliness  

#### Current Code:
```python
# @auth_router.post("/upload")
# async def upload(file: UploadFile):
#     content = await file.read()
#     blob_name, url = storage_client.upload(content, "test", file.filename, file.content_type)
#     return {"url": url, "blob_name": blob_name}
```

#### Fix:
**Delete it.** Git history preserves old code. If needed later, retrieve from version control.

---

### Issue #9: Magic Numbers in Configuration
**File:** `src/core/security.py:7, 14`  
**Severity:** 🟢 Medium  
**Type:** Configuration Management  

#### Current Code:
```python
def create_access_token(payload: dict, expires_minutes: int = 15) -> str:  # ❌ Magic number
    ...

def create_refresh_token(payload: dict, expires_days: int = 7) -> str:  # ❌ Magic number
    ...
```

#### Fix in `src/core/config.py`:
```python
class Settings(BaseSettings):
    # ... existing fields ...
    
    # JWT Token Expiration
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # ...
```

#### Update `src/core/security.py`:
```python
from .config import Config

def create_access_token(
    payload: dict, 
    expires_minutes: int | None = None
) -> str:
    if expires_minutes is None:
        expires_minutes = Config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    # ...

def create_refresh_token(
    payload: dict, 
    expires_days: int | None = None
) -> str:
    if expires_days is None:
        expires_days = Config.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    # ...
```

---

### Issue #10: No Docstrings
**Files:** All Python files  
**Severity:** 🟢 Medium  
**Type:** Documentation  

#### Current Code:
```python
class ClientService:  # ❌ No docstring
    def __init__(self, client_repo: ClientRepository):
        self.client_repo = client_repo

    def get_account_status(self, client: Client) -> str:  # ❌ No docstring
        if not (client.tenant_id and client.brand_name):
            return AccountStatus.ONBOARDING
        # ...
```

#### Fix:
```python
class ClientService:
    """Service layer for client management operations.
    
    Handles business logic for client registration, onboarding,
    authentication, and account status management.
    """
    
    def __init__(self, client_repo: ClientRepository):
        """Initialize ClientService with repository dependency.
        
        Args:
            client_repo: Client repository for data access
        """
        self.client_repo = client_repo

    def get_account_status(self, client: Client) -> str:
        """Determine current account status based on client data.
        
        Args:
            client: Client model instance
            
        Returns:
            str: Account status (ONBOARDING, SUBSCRIPTION, or ACTIVE)
        """
        if not (client.tenant_id and client.brand_name):
            return AccountStatus.ONBOARDING
        elif not (client.plan_duration and client.plan_started_at):
            return AccountStatus.SUBSCRIPTION
        else:
            return AccountStatus.ACTIVE
```

---

### Issue #11: Inconsistent Type Hints
**Files:** Multiple  
**Severity:** 🟢 Medium  
**Type:** Code Quality  

#### Example Problems:
```python
# Missing return type
async def onboarding(self, id: str, data: ClientOnboarding, logo: UploadFile):
    ...

# Inconsistent Optional usage
async def get_client_by_id(self, id: str) -> Client | None:  # ✅ Good
    ...

async def setup_onboarding(...) -> Client | None:  # ✅ Good
    ...
```

#### Fix:
```python
async def onboarding(
    self, 
    id: str, 
    data: ClientOnboarding, 
    logo: UploadFile
) -> dict[str, str]:  # ✅ Add return type
    """Handle client onboarding process."""
    ...
```

---

## 📋 Implementation Priority

### Sprint 1 (This Week)
- [ ] Fix SQL injection (Issue #1) - 5 min
- [ ] Fix debug print (Issue #3) - 2 min  
- [ ] Fix error message (Issue #4) - 1 min
- [ ] Fix variable typo (Issue #7) - 1 min
- [ ] Remove commented code (Issue #8) - 1 min

### Sprint 2 (Next Week)
- [ ] Add input validation (Issue #5) - 2 hours
- [ ] Improve exception handling (Issue #6) - 3 hours
- [ ] Move magic numbers to config (Issue #9) - 1 hour
- [ ] Add type hints (Issue #11) - 2 hours

### Sprint 3 (Week 3-4)
- [ ] Create test infrastructure (Issue #2) - 2 days
- [ ] Write unit tests (80% coverage goal) - 3 days
- [ ] Add docstrings (Issue #10) - 2 days

---

## 🎯 Success Metrics

After fixes, code should achieve:
- ✅ 0 critical security vulnerabilities
- ✅ 80%+ test coverage
- ✅ 100% public API documentation
- ✅ 0 TODOs/FIXMEs without tickets
- ✅ All linting passing
- ✅ Type hints on all functions

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-11  
**Issues Identified:** 11  
**Estimated Fix Time:** ~3 weeks (with testing)
