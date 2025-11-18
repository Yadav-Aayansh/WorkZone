from src.core.database import PublicBase
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, JSON, String, ForeignKey
from sqlalchemy.orm import relationship

class Setting(PublicBase):
    __tablename__ = "settings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, unique=True, index=True)
    leave_types = Column(JSON, default={
        "casual": {"days": 12, "carry_forward": False, "encashable": False},
        "sick": {"days": 10, "carry_forward": False, "encashable": False},
        "earned": {"days": 15, "carry_forward": True, "max_carry": 30, "encashable": True},
        "maternity": {"days": 180, "carry_forward": False, "encashable": False},
        "paternity": {"days": 15, "carry_forward": False, "encashable": False}
    })

    client = relationship("Client", back_populates="setting", uselist=False)