import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BioAuth Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tokens
    SECRET_KEY: str = "bioauth_enterprise_default_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MySQL Database Connection
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "facial_recognition_database"

    # Async Database URL
    DATABASE_URL: str = "mysql+aiomysql://root:@localhost:3306/facial_recognition_database"

    # Redis & Broker
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Biometrics & AI Thresholds
    RECOGNITION_THRESHOLD: float = 0.85  # Cosine similarity min threshold
    QUALITY_THRESHOLD: float = 0.75
    ENABLE_LIVENESS: bool = True
    EMBEDDING_DIMENSION: int = 512

    # Storage
    STORAGE_DIR: str = "./uploads"

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
