from src.repository.tenant import (
    UserRepository, RecruiterRepository, ManagerRepository,
    EmployeeRepository, ApplicantRepository
)
from src.schemas.tenant import (
    UserSignupRequest, UserSignupInvitedRequest, UserLoginRequest, 
    UserRefreshRequest, UserResetPasswordRequest, UserForgotPasswordRequest
)
from src.models.tenant import User
from src.exceptions.tenant import (
    UserAlreadyExistsError, InvitationRequiredError, UserNotFoundError,
    InvalidUserCredentialsError
)
from src.utils.hashing import hash_password, verify_password
from src.core.security import create_tokens, decode_token, create_access_token
from src.core.config import Config
from src.models.tenant import Role
from src.core.context import tenant_context
from src.tasks import create_leave_entitlement_task, send_tenant_reset_password_email_task

class UserService:
    def __init__(
            self,
            user_repo: UserRepository,
            recruiter_repo: RecruiterRepository,
            manager_repo: ManagerRepository,
            employee_repo: EmployeeRepository,
            applicant_repo: ApplicantRepository

    ):
        self.user_repo = user_repo
        self.manager_repo = manager_repo
        self.recruiter_repo = recruiter_repo
        self.employee_repo = employee_repo
        self.applicant_repo = applicant_repo

    async def register(self, data: UserSignupRequest) -> dict:
        if data.role != Role.APPLICANT:
            raise InvitationRequiredError("This role requires invitation")
    
        return await self._create_user(data.name, data.email, data.password, data.role)


    async def register_invited(self, data: UserSignupInvitedRequest) -> dict:
        tenant_id = tenant_context.get()
        user_data = decode_token(data.token, f"{tenant_id}.{Config.DOMAIN_NAME}")

        name = user_data.get("name")
        email = user_data.get("email")
        role = Role(user_data.get("role"))
        title = user_data.get("title")
        manager_id = user_data.get("manager_id")
            
        
        return await self._create_user(name, email, data.password, role, title, manager_id)


    async def _create_role_profile(self, user_id: str, role: Role, title: str | None = None, manager_id: str | None = None):
        match role:
            case Role.MANAGER:
                await self.manager_repo.create_manager(user_id)
            case Role.RECRUITER:
                await self.recruiter_repo.create_recruiter(user_id)
            case Role.EMPLOYEE:
                employee = await self.employee_repo.create_employee(user_id, title, manager_id)
                tenant_id = tenant_context.get()
                create_leave_entitlement_task.delay(tenant_id, employee.id)
            case Role.APPLICANT:
                await self.applicant_repo.create_applicant(user_id)


    async def _create_user(self, name: str, email: str, password: str, role: Role, title: str | None = None, manager_id: str | None = None) -> dict:
        is_exist = await self.user_repo.get_user_by_email(email)
        if is_exist:
            raise UserAlreadyExistsError(f"Email {email} already exists!")
        
        hashed_password = hash_password(password)
        user = await self.user_repo.create_user(
            name=name,
            email=email,
            password=hashed_password,
            role=role
        )
        
        await self._create_role_profile(user.id, role, title, manager_id)
    
        return create_tokens(self._build_token_payload(user))

    def _build_token_payload(self, user: User) -> dict:
        tenant_id = tenant_context.get()
        return {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "aud": f"{tenant_id}.{Config.DOMAIN_NAME}"
        }
        
    async def login(self, data: UserLoginRequest) -> dict:
        user = await self.user_repo.get_user_by_email(data.email)
        if not user:
            raise UserNotFoundError("Account does not exist!")
        
        if not verify_password(data.password, user.password):
            raise InvalidUserCredentialsError("Incorrect email or password!")

        return create_tokens(self._build_token_payload(user))
    
    async def refresh(self, data: UserRefreshRequest) -> dict:
        tenant_id = tenant_context.get()
        current_user = decode_token(data.refresh_token, f"{tenant_id}.{Config.DOMAIN_NAME}", "refresh")
        user = await self.user_repo.get_user_by_id(current_user.get("sub"))
        if not user:
            raise UserNotFoundError("Account does not exist!")
        
        return create_tokens(self._build_token_payload(user))
    

    async def forgot_password(self, data: UserForgotPasswordRequest) -> dict:
        user = await self.user_repo.get_user_by_email(data.email)
        if not user:
            raise UserNotFoundError("Account does not exist!")
        
        tenant_id = tenant_context.get()
        tenant_subdomain = f"{tenant_id}.{Config.DOMAIN_NAME}"
        token = create_access_token(self._build_token_payload(user), expires_minutes=60)

        reset_link = f"https://{tenant_id}.{Config.DOMAIN_NAME}/reset-password?token={token}"
        send_tenant_reset_password_email_task.delay(data.email, user.name, reset_link, tenant_id.capitalize(), tenant_subdomain)
        return {"message": "Password reset link sent!"}
    
    async def reset_password(self, data: UserResetPasswordRequest) -> dict:
        tenant_id = tenant_context.get()
        current_user = decode_token(data.token, f"{tenant_id}.{Config.DOMAIN_NAME}", "access")
        user = await self.user_repo.get_user_by_id(current_user.get("sub"))
        if not user:
            raise UserNotFoundError("Account does not exist!")
        
        hashed_password = hash_password(data.password)
        await self.user_repo.change_password(user.id, hashed_password)
        
        return create_tokens(self._build_token_payload(user))