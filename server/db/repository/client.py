

from fastapi import Depends
from sqlalchemy.orm import Session
from models import Client
from schemas import ClientBase
from db import get_tenant_db

def create_client(client_data: ClientBase, db: Session = Depends(get_tenant_db)):
    new_client = Client(name=client_data.name)
    db.add(new_client)
    db.commit()
    return new_client
