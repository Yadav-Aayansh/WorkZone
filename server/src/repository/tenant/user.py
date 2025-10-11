

from fastapi import Depends
from sqlalchemy.orm import Session
from server.src.models.tenant import User
from src.schemas import UserBase
from src.core.database import get_tenant_db

def create_user(user_data: UserBase, db: Session = Depends(get_tenant_db)):
    new_user = User(name=user_data.name)
    db.add(new_user)
    db.commit()
    return new_user
