from fastapi import Depends, Request, HTTPException, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_public_db, get_schema
from src.repository.platform import ClientRepository, OrderRepository, SettingRepository
from src.repository.tenant import (
    UserRepository, ManagerRepository, RecruiterRepository,
    EmployeeRepository, ApplicantRepository, JobRepository,
    ApplicationRepository, AiInterviewRepository, LeaveEntitlementRepository,
    LeaveRequestRepository, LearningPathRepository, QueryRepository
)
from src.services.platform import (
    ClientService, OrderService, WorkspaceService
)
from src.services.tenant import (
    UserService, RecruiterService, ManagerService, EmployeeService,
    ApplicantService, JobService, ApplicationService, AiInterviewService,
    LeaveService, LearningPathService, QueryService
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.exceptions.base import RoleNotAllowedError
from .security import decode_token
from src.utils.misc import get_tenant_id_or_domain
from src.exceptions.platform import TenantNotFoundError
from .context import tenant_context, user_context
from .config import Config
from .logger import logger
from src.models.tenant import Role
from typing import Union

def get_client_service(db: AsyncSession = Depends(get_public_db)):
    repo = ClientRepository(db)
    return ClientService(repo)

def get_order_service(
    db: AsyncSession = Depends(get_public_db),
    client_service: ClientService = Depends(get_client_service)
):
    repo = OrderRepository(db)
    return OrderService(repo, client_service)

def get_workspace_service(db: AsyncSession = Depends(get_public_db)):
    client_repo = ClientRepository(db)
    setting_repo = SettingRepository(db)
    return WorkspaceService(client_repo, setting_repo)
    

    
security_guard = HTTPBearer()

def get_current_user(*, use_tenant: bool = False, roles: list[str] | None = None):
    def validate_and_extract_user(payload, roles):
        if roles:
            allowed_roles = [r.value if isinstance(r, Role) else r for r in roles]
            if payload.get("role") not in allowed_roles:
                raise RoleNotAllowedError("Invalid role!")
        user_context.set(payload.get("sub"))
        return payload
    
    if use_tenant:
        async def dependency(
            credentials: HTTPAuthorizationCredentials = Depends(security_guard),
            tenant_id: str = Depends(get_tenant_id)
        ):
            audience = f"{tenant_id}.{Config.DOMAIN_NAME}"
            payload = decode_token(credentials.credentials, audience)
            return validate_and_extract_user(payload, roles)
    else:
        async def dependency(
            credentials: HTTPAuthorizationCredentials = Depends(security_guard)
        ):
            audience = Config.DOMAIN_NAME
            payload = decode_token(credentials.credentials, audience)
            return validate_and_extract_user(payload, roles)

    return dependency

async def get_tenant_id(
    request: Request,
    client_service: ClientService = Depends(get_client_service)
) -> str:
    try:
        host = request.url.hostname
        tenant_or_domain = get_tenant_id_or_domain(host)
        tenant_id = await client_service.get_tenant(tenant_or_domain)
        tenant_context.set(tenant_id)
        return tenant_id
    except TenantNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

async def get_tenant_db(tenant_id: str = Depends(get_tenant_id)):
    async for session in get_schema(tenant_id):
        yield session 

# For Websocket connections
async def get_tenant_id_ws(
    websocket: WebSocket,
    client_service: ClientService = Depends(get_client_service)
) -> str:
    try:
        logger.info("1st")
        host = websocket.headers.get('host')
        tenant_or_domain = get_tenant_id_or_domain(host)
        tenant_id = await client_service.get_tenant(tenant_or_domain)
        tenant_context.set(tenant_id)
        return tenant_id
    except TenantNotFoundError as e:
        await websocket.close(code=1008, reason="Tenant not found")
        raise

async def get_tenant_db_ws(tenant_id: str = Depends(get_tenant_id_ws)):
    async for session in get_schema(tenant_id):
        yield session 


async def get_user_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    recruiter_repo = RecruiterRepository(db)
    manager_repo = ManagerRepository(db)
    employee_repo = EmployeeRepository(db)
    applicant_repo = ApplicantRepository(db)
    return UserService(user_repo, recruiter_repo, manager_repo, employee_repo, applicant_repo)

async def get_recruiter_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    recruiter_repo = RecruiterRepository(db)
    return RecruiterService(user_repo, recruiter_repo)

async def get_manager_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    manager_repo = ManagerRepository(db)
    return ManagerService(user_repo, manager_repo)

async def get_employee_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    employee_repo = EmployeeRepository(db)
    return EmployeeService(user_repo, employee_repo)

async def get_applicant_service(db: AsyncSession = Depends(get_tenant_db)):
    user_repo = UserRepository(db)
    applicant_repo = ApplicantRepository(db)
    return ApplicantService(user_repo, applicant_repo)

async def get_job_service(db: AsyncSession = Depends(get_tenant_db)):
    job_repo = JobRepository(db)
    return JobService(job_repo)

async def get_application_service(db: AsyncSession = Depends(get_tenant_db)):
    job_repo = JobRepository(db)
    application_repo = ApplicationRepository(db)
    return ApplicationService(job_repo, application_repo)


async def get_ai_interview_service(db: AsyncSession = Depends(get_tenant_db)):
    ai_interview_repo = AiInterviewRepository(db)
    application_repo = ApplicationRepository(db)
    return AiInterviewService(ai_interview_repo, application_repo)

# For WebSocket routes
async def get_ai_interview_service_ws(db: AsyncSession = Depends(get_tenant_db_ws)):
    ai_interview_repo = AiInterviewRepository(db)
    application_repo = ApplicationRepository(db)
    return AiInterviewService(ai_interview_repo, application_repo)


async def get_leave_service(db: AsyncSession = Depends(get_tenant_db)):
    employee_repo = EmployeeRepository(db)
    manager_repo = ManagerRepository(db)
    leave_entitlement_repo = LeaveEntitlementRepository(db)
    leave_request_repo = LeaveRequestRepository(db)
    return LeaveService(employee_repo, manager_repo, leave_entitlement_repo, leave_request_repo)

def get_learning_path_service(
    employee_repo: EmployeeRepository = Depends(get_tenant_db),
    learning_path_repo: LearningPathRepository = Depends(get_tenant_db)
) -> LearningPathService:
    return LearningPathService(employee_repo, learning_path_repo)

def get_query_service(
    query_repo: QueryRepository = Depends(get_tenant_db),
    employee_repo: EmployeeRepository = Depends(get_tenant_db)
) -> QueryService:
    return QueryService(query_repo, employee_repo)