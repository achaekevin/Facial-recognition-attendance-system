import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BioAuth Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tokens (Read from environment or .env, default fallback)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bioauth_enterprise_default_secret_key_change_in_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MySQL Database Connection (Read from environment or .env)
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_DB: str = os.getenv("MYSQL_DB", "facial_recognition_database")

    # Async Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"mysql+aiomysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
        if MYSQL_PASSWORD
        else f"mysql+aiomysql://{MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )

    # Redis & Broker
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")

    # Biometrics & AI Thresholds
    RECOGNITION_THRESHOLD: float = 0.85  # Cosine similarity min threshold
    QUALITY_THRESHOLD: float = 0.75
    ENABLE_LIVENESS: bool = True
    EMBEDDING_DIMENSION: int = 512

    # Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./uploads")

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
