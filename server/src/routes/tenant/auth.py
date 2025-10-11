# from fastapi import APIRouter, Depends
# from src.schemas.platform import UserBase
# from sqlalchemy.orm import Session
# from src.core.database import get_tenant_db, create_tenant_schema, get_public_db
# from src.repository.tenant.user import create_user

# signup_router = APIRouter(prefix="/api", tags=["Auth"])

# @signup_router.post(path="/signup", status_code=201)
# def signup(user_data: UserBase, db: Session = Depends(get_tenant_db)):
#     user = create_user(user_data, db)
#     return user
