#

from db import Base
from sqlalchemy import Column, Integer, String

# amazon.workzone.tech -> jobs.amazon.me

# amazon

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(25), nullable=False)
