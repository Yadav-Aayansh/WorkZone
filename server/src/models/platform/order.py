import uuid, enum
from src.core.database import PublicBase
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from src.utils.datetime import get_indian_time
from sqlalchemy.orm import relationship

class SubscriptionPlan(enum.Enum):
    THREE_MONTHS = "3_months"
    SIX_MONTHS = "6_months"
    TWELVE_MONTHS = "12_months"

    @property
    def fee(self) -> int:
        fees = {
            self.THREE_MONTHS: 29999,
            self.SIX_MONTHS: 49999,
            self.TWELVE_MONTHS: 99999
        }
        return fees[self]
    
    @property
    def validity(self) -> int:
        validities = {
            self.THREE_MONTHS: 3,
            self.SIX_MONTHS: 6,
            self.TWELVE_MONTHS: 12
        }
        return validities[self]


class PaymentStatus(enum.Enum):
    CREATED = "created"
    AUTHORIZED = "authorized"
    CAPTURED = "captured"
    FAILED = "failed"
    REFUNDED = "refunded"

class Order(PublicBase):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    razorpay_order_id = Column(String(255), unique=True, nullable=False, index=True)
    razorpay_payment_id = Column(String(255), unique=True, nullable=True, index=True)
    razorpay_signature = Column(String(512), nullable=True)
    plan = Column(Enum(SubscriptionPlan), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.CREATED)
    created_at = Column(DateTime(timezone=True), default=get_indian_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=get_indian_time, onupdate=get_indian_time, nullable=False)

    client = relationship("Client", back_populates="orders", uselist=False)