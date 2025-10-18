from sqlalchemy.ext.asyncio import AsyncSession
from src.models.platform import Order
from sqlalchemy import select

class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_order_by_order_id(self, order_id: str) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.razorpay_order_id==order_id))
        return result.scalar_one_or_none() 

    async def create_order(self, client_id: str, order_id: str, plan: str, amount: int, currency: str, status: str) -> Order:
        try:
            new_order = Order(
                client_id=client_id,
                razorpay_order_id=order_id,
                plan=plan,
                amount=amount,
                currency=currency,
                status=status
            )
            self.db.add(new_order)
            await self.db.commit()
            await self.db.refresh(new_order)
            return new_order
        except:
            await self.db.rollback()
            print()

    async def update_order(self, order_id: str, payment_id: str, signature: str, status: str) -> Order:
        try:
            order = await self.get_order_by_order_id(order_id)
            if not order:
                return 
            order.razorpay_payment_id = payment_id
            order.razorpay_signature = signature
            order.status = status
            await self.db.commit()
            await self.db.refresh(order)
            return order
        except:
            await self.db.rollback()
            print()



