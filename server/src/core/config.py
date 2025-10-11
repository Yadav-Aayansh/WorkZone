from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    FRONTEND_URL: str
    DATABASE_URL: str
    LOG_LEVEL: str

    # Google Cloud
    GOOGLE_PROJECT_ID: str
    GOOGLE_PRIVATE_KEY: str
    GOOGLE_CLIENT_EMAIL: str
    GCS_BUCKET_NAME: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str

    DOMAIN_NAME: str

    # Class Variable
    model_config = SettingsConfigDict(
        env_file = str(Path(__file__).parent.parent.parent / ".env")
    )


Config = Settings()
