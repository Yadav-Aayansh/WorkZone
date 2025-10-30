from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    FRONTEND_URL: str
    LOG_LEVEL: str

    # Database
    SYNC_DATABASE_URL: str
    ASYNC_DATABASE_URL: str

    # Google Cloud
    GOOGLE_PROJECT_ID: str
    GOOGLE_PRIVATE_KEY: str
    GOOGLE_CLIENT_EMAIL: str
    GCS_BUCKET_NAME: str

    # Google API key for LLM and embedding model
    GOOGLE_API_KEY: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

    DOMAIN_NAME: str

    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # Background Tasks
    REDIS_URL: str

    # SMTP
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_NAME: str
    SMTP_USER: str
    SMTP_PASSWORD: str

    # Class Variable
    model_config = SettingsConfigDict(
        env_file = str(Path(__file__).parent.parent.parent / ".env")
    )


Config = Settings()
