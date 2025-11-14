from src.repository.tenant import UserRepository, RecruiterRepository
from src.exceptions.tenant import UserNotFoundError, RecruiterNotFoundError
from src.schemas.tenant import RecruiterProfileResponse

class RecruiterService:
    def __init__(self, user_repo: UserRepository, recruiter_repo: RecruiterRepository):
        self.user_repo = user_repo
        self.recruiter_repo = recruiter_repo

    async def profile(self, user_id: str):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User does not exist!")
        
        recruiter = await self.recruiter_repo.get_recruiter_by_user_id(user_id)
        if not recruiter:
            raise RecruiterNotFoundError(f"Recruiter does not exist!")
        
        return RecruiterProfileResponse(
            user_id=user.id,
            recruiter_id=recruiter.id,
            name=user.name,
            email=user.email
        )