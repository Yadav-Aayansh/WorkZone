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
        amount_in_paise = amount * 100
        order = razorpay_client.create_order(amount_in_paise)
        await self.order_repo.create_order(
            client_id=client_id,
            order_id=order['id'],
            plan=data.plan,
            amount=amount,
            currency=order['currency'],
            status=PaymentStatus.CREATED
        )
        return order
    
    async def update_order(self, data: UpdateOrder) -> Order:
        
        # Verify payment signature
        is_valid = razorpay_client.verify_payment_signature(
            order_id=data.order_id,
            payment_id=data.payment_id,
            signature=data.signature
        )
        
        print(f"Signature Valid: {is_valid}")
        
        if not is_valid:
            raise Exception("Invalid payment signature")
        
        # Get payment status from Razorpay
        status_str = razorpay_client.get_payment_status(data.payment_id)
        print(f"Payment Status from Razorpay: {status_str}")
        
        # Convert status string to PaymentStatus enum
        try:
            status = PaymentStatus(status_str)
        except ValueError:
            print(f"Unknown payment status: {status_str}, defaulting to FAILED")
            status = PaymentStatus.FAILED
        
        # Update order in database
        order = await self.order_repo.update_order(
            order_id=data.order_id,
            payment_id=data.payment_id,
            signature=data.signature,
            status=status
        )
        
        print(f"Order updated in DB: {order.id if order else 'None'}")
        
        # Activate subscription if payment is captured
        if status == PaymentStatus.CAPTURED:
            print(f"Activating subscription for client: {order.client_id}")
            response = await self.client_service.activate_subscription(order.client_id, order.plan)
            print(f"Subscription activated successfully")
            return response
        
        print(f"Payment not captured, status: {status}")
        return order


