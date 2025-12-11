import httpx
import asyncio
from typing import Optional


class HTTPClient:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def get_client(self) -> httpx.AsyncClient:
        # Get current event loop
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            current_loop = None

        # If client exists but was created on a different/closed loop, recreate it
        if self._client is not None:
            if self._loop is None or self._loop.is_closed() or self._loop != current_loop:
                # Old client is stale, create new one
                self._client = None

        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0, connect=10.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
                follow_redirects=True
            )
            self._loop = current_loop

        return self._client

    async def close(self):
        if self._client is not None:
            await self._client.aclose()
            self._client = None
            self._loop = None


http_client = HTTPClient()
