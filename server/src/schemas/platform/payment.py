from pydantic import BaseModel

class RazorpayCreateOrder(BaseModel):
    amount: int
    currency: str

class RazorpayVerifyPaymentSignature(BaseModel):
    order_id: str
    payment_id: str
    signature: str