import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "BioAuth Enterprise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tokens (Read from environment or .env, default fallback)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bioauth_enterprise_default_secret_key_change_in_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MySQL Database Connection (Read from environment or .env)
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "facial_recognition_database"

    OVERRIDE_DATABASE_URL: str = ""

    @property
    def DATABASE_URL(self) -> str:
        if self.OVERRIDE_DATABASE_URL:
            return self.OVERRIDE_DATABASE_URL
        if self.MYSQL_PASSWORD:
            return f"mysql+aiomysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        return f"mysql+aiomysql://{self.MYSQL_USER}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

    # Redis & Broker
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")

    # Biometrics & AI Thresholds
    RECOGNITION_THRESHOLD: float = 0.85  # Cosine similarity min threshold
    QUALITY_THRESHOLD: float = 0.75
    ENABLE_LIVENESS: bool = True
    EMBEDDING_DIMENSION: int = 512

    # Storage & Image Encryption
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./uploads")
    IMAGE_ENCRYPTION_KEY: str = os.getenv("IMAGE_ENCRYPTION_KEY", "bioauth_master_biometric_image_aes256_key_32bytes!")
    IMAGE_TOKEN_SECRET: str = os.getenv("IMAGE_TOKEN_SECRET", "bioauth_ephemeral_image_token_secret_salt")

    @property
    def ENCRYPTED_STORAGE_DIR(self) -> str:
        return os.path.join(self.STORAGE_DIR, "encrypted")

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.ENCRYPTED_STORAGE_DIR, exist_ok=True)
