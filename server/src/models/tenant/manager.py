from src.core.database import TenantBase
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from src.utils.datetime import get_indian_time

class Manager(TenantBase):
    __tablename__ = "managers"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    user = relationship("User", back_populates="manager", uselist=False)