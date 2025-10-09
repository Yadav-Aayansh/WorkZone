import enum
from db import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, DateTime, Enum
from utils.datetime import get_indian_time

class Role(enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    RECRUITER = "recruiter"
    APPLICANT = "applicant"

class User(TenantBase):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(Role), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    employee = relationship("Employee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    manager = relationship("Manager", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter = relationship("Recruiter", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applicant = relationship("Applicant", back_populates="user", uselist=False, cascade="all, delete-orphan")
