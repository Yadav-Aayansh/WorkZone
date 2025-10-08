

from fastapi import APIRouter, Depends
from schemas import UserBase, ClientBase
from sqlalchemy.orm import Session
from db import get_tenant_db, create_tenant_schema, get_db
from db.repository.user import create_user
from db.repository.client import create_client

signup_router = APIRouter(prefix="/api", tags=["Auth"])

@signup_router.post(path="/signup", status_code=201)
def signup(user_data: UserBase, db: Session = Depends(get_tenant_db)):
    user = create_user(user_data, db)
    return user


@signup_router.post(path="/registration", status_code=201)
def registration(client_data: ClientBase, db: Session = Depends(get_db)):
    client = create_client(client_data, db)
    create_tenant_schema(client_data.name)
    return client