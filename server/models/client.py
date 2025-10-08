from db import Base
from sqlalchemy import Column, Integer, String, DateTime
from utils.datetime import get_indian_time

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    tenant_id = Column(String(50), nullable=True, unique=True, index=True)
    brand_name = Column(String(100), nullable=True)
    logo = Column(String(500), nullable=True)
    domain = Column(String(100), nullable=True)
    plan_duration = Column(Integer, nullable=True)
    plan_started_at = Column(DateTime(timezone=True), nullable=True)
    plan_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

