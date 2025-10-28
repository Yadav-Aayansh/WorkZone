from src.repository.tenant import (
    UserRepository, RecruiterRepository, ManagerRepository,
    EmployeeRepository, ApplicantRepository
)
from src.schemas.tenant import UserSignupRequest, UserSignupInvitedRequest
from src.models.tenant import User
from src.exceptions.tenant import UserAlreadyExistsError, InvitationRequiredError
from src.utils.hashing import hash_password, verify_password
from src.core.security import create_tokens, decode_token
from src.core.config import Config
from src.models.tenant import Role
from src.core.contex import tenant_context

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


    async def register_invited(self, data: UserSignupInvitedRequest):
        tenant_id = tenant_context.get()
        user_data = decode_token(data.token, f"{tenant_id}.{Config.DOMAIN_NAME}")

        name = user_data.get("name")
        email = user_data.get("email")
        role = Role(user_data.get("role"))
        
        return await self._create_user(name, email, data.password, role)


    async def _create_role_profile(self, user_id: str, role: Role):
        match role:
            case Role.MANAGER:
                await self.manager_repo.create_manager(user_id)
            case Role.RECRUITER:
                await self.recruiter_repo.create_recruiter(user_id)
            case Role.EMPLOYEE:
                await self.employee_repo.create_employee(user_id)
            case Role.APPLICANT:
                await self.applicant_repo.create_applicant(user_id)


    async def _create_user(self, name: str, email: str, password: str, role: Role) -> dict:
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
        
        await self._create_role_profile(user.id, role)
        
        tenant_id = tenant_context.get()
        return create_tokens({
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "aud": f"{tenant_id}.{Config.DOMAIN_NAME}"
        })




