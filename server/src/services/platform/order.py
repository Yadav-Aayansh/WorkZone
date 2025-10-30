from src.repository.platform import OrderRepository
from src.schemas.platform import CreateOrder, UpdateOrder
from src.core.payment import razorpay_client
from src.models.platform import PaymentStatus, Order
from .client import ClientService
from src.exceptions.platform import InvalidPaymentSignature

class OrderService:
    def __init__(self, order_repo: OrderRepository, client_service: ClientService):
        self.order_repo = order_repo
        self.client_service = client_service

    async def create_order(self, client_id: str, data: CreateOrder):
        amount = data.plan.fee * 100
        order = razorpay_client.create_order(amount)
        await self.order_repo.create_order(
            client_id=client_id,
            order_id=order["id"],
            plan=data.plan,
            amount=amount,
            currency=order["currency"],
            status=PaymentStatus.CREATED
        )
        return order
    
    async def update_order(self, data: UpdateOrder) -> Order:
        try:
            is_valid = razorpay_client.verify_payment_signature(
                order_id=data.order_id,
                payment_id=data.payment_id,
                signature=data.signature
            )
            if not is_valid:
                raise InvalidPaymentSignature(f"Payment verification failed!")
            
            status_str = razorpay_client.get_payment_status(data.payment_id)
            status = PaymentStatus(status_str)
            order = await self.order_repo.update_order(
                order_id=data.order_id,
                payment_id=data.payment_id,
                signature=data.signature,
                status=status
            )
            if status == PaymentStatus.CAPTURED:
                response = await self.client_service.activate_subscription(order.client_id, order.plan)
                return response
        except Exception as e:
            raise
            

