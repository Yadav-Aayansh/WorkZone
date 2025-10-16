from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.core.database import init_db
from src.routes.platform import platform_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI()

app.include_router(platform_router)
