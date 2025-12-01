import uuid
from sqlalchemy.orm import relationship
from src.core.database import TenantBase
from sqlalchemy import Column, JSON, Integer, ForeignKey, UniqueConstraint, UUID

class LeaveEntitlement(TenantBase):
    __tablename__ = "leave_entitlements"
    __table_args__ = (
        UniqueConstraint('employee_id', 'fiscal_year', name='one_entitlement_per_year'),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    fiscal_year = Column(Integer, nullable=False)
    granted = Column(JSON, nullable=False)
    used = Column(JSON, default={})

    employee = relationship("Employee", back_populates="leave_entitlements")
    
    @property
    def balance(self):
        return {k: self.granted[k] - self.used.get(k, 0) for k in self.granted}
    
