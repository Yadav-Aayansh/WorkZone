from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.core.database import init_db
from src.routes.platform import platform_router
from src.routes.tenant import tenant_router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="WorkZone",
    description="APIs for WorkZone.tech",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Noctivagous!! 
    allow_credentials=True,
    allow_methods=["*"],  # Noctivagous!!
    allow_headers=["*"],  # Noctivagous!!
)

app.include_router(platform_router)
app.include_router(tenant_router)