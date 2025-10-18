import razorpay, hmac, hashlib
import razorpay.errors
from .config import Config

class RazorpayClient:
    def __init__(self):
        self.client = razorpay.Client(auth=(
            Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET
        ))

    def create_order(self, amount: int, currency: str = "INR") -> dict:
        try:
            order_data = {
                "amount": amount,
                "currency": currency,
            }

            order = self.client.order.create(data=order_data)
            return order
        except Exception as e:
            print(e)

    def get_payment_status(self, payment_id: str) -> str:
        try:
            payment = self.client.payment.fetch(payment_id)
            return payment.get("status")
        except Exception as e:
            print(e)
    
    def verify_payment_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        try:
            params_dict = {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature
            }

            self.client.utility.verify_payment_signature(params_dict)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
        except Exception as e:
            print(e)

    def verify_webhook_signature(self, payload: str, signature: str):
        try:
            expected_signature = hmac.new(
                Config.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
                payload.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected_signature, signature)
        except:
            return False

razorpay_client = RazorpayClient()