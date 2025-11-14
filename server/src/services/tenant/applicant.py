from src.repository.tenant import UserRepository, ApplicantRepository
from src.exceptions.tenant import UserNotFoundError, ApplicantNotFoundError
from src.schemas.tenant import ApplicantProfileResponse

class ApplicantService:
    def __init__(self, user_repo: UserRepository, applicant_repo: ApplicantRepository):
        self.user_repo = user_repo
        self.applicant_repo = applicant_repo

    async def profile(self, user_id: str):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User does not exist!")
        
        applicant = await self.applicant_repo.get_applicant_by_user_id(user_id)
        if not applicant:
            raise ApplicantNotFoundError(f"Applicant does not exist!")
        
        return ApplicantProfileResponse(
            user_id=user.id,
            applicant_id=applicant.id,
            name=user.name,
            email=user.email
        )