import json
import redis.asyncio as redis
from typing import Optional
from .config import Config

class RedisClient:
    def __init__(self):
        self.client = redis.from_url(Config.REDIS_URL, decode_responses=True)
    
    async def set_session(self, session_id: str, data: dict, hours: int = 24) -> None:
        await self.client.setex(
            f"interview_session:{session_id}",
            hours * 3600,
            json.dumps(data, default=str)
        )
    
    async def get_session(self, session_id: str) -> Optional[dict]:
        data = await self.client.get(f"interview_session:{session_id}")
        return json.loads(data) if data else None
    
    async def delete_session(self, session_id: str) -> None:
        await self.client.delete(f"interview_session:{session_id}")

    update_session = set_session

    
redis_client = RedisClient()