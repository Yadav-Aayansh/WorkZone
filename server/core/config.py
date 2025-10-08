from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    FRONTEND_URL: str
    DATABASE_URL: str
    LOG_LEVEL: str

    # Class Variable
    model_config = SettingsConfigDict(
        env_file = str(Path(__file__).parent / ".env")
    )


Config = Settings()
