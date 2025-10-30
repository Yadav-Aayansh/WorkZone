from pydantic import BaseModel
from src.models.platform import SubscriptionPlan

class CreateOrder(BaseModel):
    plan: SubscriptionPlan

class UpdateOrder(BaseModel):
    order_id: str
    payment_id: str
    signature: str