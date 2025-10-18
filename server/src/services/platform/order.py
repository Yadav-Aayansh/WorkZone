from src.repository.platform import OrderRepository
from src.schemas.platform import CreateOrder, UpdateOrder
from src.core.payment import razorpay_client
from src.models.platform import PaymentStatus, Order
from .client import ClientService

class OrderService:
    def __init__(self, order_repo: OrderRepository, client_service: ClientService):
        self.order_repo = order_repo
        self.client_service = client_service

    async def create_order(self, client_id: str, data: CreateOrder):
        amount = data.plan.fee
        order = razorpay_client.create_order(amount)
        await self.order_repo.create_order(
            client_id=client_id,
            order_id=order.id,
            plan=data.plan,
            amount=amount,
            currency=order.currency,
            status=PaymentStatus.CREATED
        )
        return order
    
    async def update_order(self, data: UpdateOrder) -> Order:
        try:
            status = razorpay_client.get_payment_status(data.payment_id)
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
            print(e)
            

