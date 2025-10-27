from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import User, Employee, Manager, Recruiter, Role
from sqlalchemy import select

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create_user(self, name: str, email: str, hashed_password: str, role: Role) -> User:
        try:
            new_user = User(
                name=name,
                email=email,
                hashed_password=hashed_password,
                role=role
            )
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            
            # Create role-specific entry
            if role == Role.EMPLOYEE:
                employee = Employee(user_id=new_user.id)
                self.db.add(employee)
            elif role == Role.MANAGER:
                manager = Manager(user_id=new_user.id)
                self.db.add(manager)
            elif role == Role.RECRUITER:
                recruiter = Recruiter(user_id=new_user.id)
                self.db.add(recruiter)
            
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
        except Exception:
            await self.db.rollback()
            raise

