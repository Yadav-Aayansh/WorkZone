from sqlalchemy.ext.asyncio import AsyncSession
from src.models.tenant import User
from sqlalchemy import select, exists
from src.models.tenant import Role

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def is_email_exist(self, email: str) -> bool:
        result = await self.db.execute(select(exists().where(User.email==email)))
        return result.scalar()

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email==email))
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id==id))
        return result.scalar_one_or_none()
    
    async def create_user(self, name: str, email: str, password: str, role: Role) -> User:
        new_user = User(
            name=name,
            email=email,
            password=password,
            role=role
        )

        self.db.add(new_user)
        await self.db.flush()
        return new_user
    
    async def change_password(self, id: str, password: str):
        user = await self.get_user_by_id(id)
        user.password = password
        await self.db.commit()
        await self.db.refresh(user)
        return user
    


        
