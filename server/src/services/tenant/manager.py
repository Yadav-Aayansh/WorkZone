from src.repository.tenant import UserRepository, ManagerRepository
from src.exceptions.tenant import UserNotFoundError, ManagerNotFoundError
from src.schemas.tenant import ManagerProfileResponse

class ManagerService:
    def __init__(self, user_repo: UserRepository, manager_repo: ManagerRepository):
        self.user_repo = user_repo
        self.manager_repo = manager_repo

    async def profile(self, user_id: str):
        user = await self.user_repo.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User does not exist!")
        
        manager = await self.manager_repo.get_manager_by_user_id(user_id)
        if not manager:
            raise ManagerNotFoundError(f"Manager does not exist!")
        
        return ManagerProfileResponse(
            user_id=user.id,
            manager_id=manager.id,
            name=user.name,
            email=user.email
        )