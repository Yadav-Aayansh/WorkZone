from celery import Celery
from .config import Config

worker = Celery(
    broker=Config.REDIS_URL,
    backend=Config.REDIS_URL,
    include=[
        "src.tasks.email",
        "src.tasks.tenant"
    ]
)