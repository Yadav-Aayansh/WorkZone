import httpx
from typing import Optional


class HTTPClient:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
    
    def get_client(self) -> httpx.AsyncClient:
        """Get or create the shared httpx client"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
                follow_redirects=True
            )
        return self._client
    
    async def close(self):
        """Close the shared client"""
        if self._client is not None:
            await self._client.aclose()
            self._client = None


# Singleton instance
http_client = HTTPClient()
