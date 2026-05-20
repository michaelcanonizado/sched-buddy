from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List


# sched-buddy/backend/  →  sched-buddy/
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent           # sched-buddy/
_ML_DIR = _REPO_ROOT / "ml"               # sched-buddy/ml/


class Settings(BaseSettings):
    # API
    APP_NAME: str = "SchedBuddy API"
    DEBUG: bool = False

    # CORS — update with your Next.js dev/prod URLs
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Directory layout
    BACKEND_DIR: Path = _BACKEND_DIR
    REPO_ROOT: Path = _REPO_ROOT
    ML_DIR: Path = _ML_DIR

    # Storage — written by the backend
    UPLOAD_DIR: Path = _BACKEND_DIR / "uploads"
    OUTPUT_DIR: Path = _BACKEND_DIR / "outputs"

    MODEL_PATH: Path = _ML_DIR / "model.pt"

    # Pipeline thresholds (mirror ml/config.py defaults)
    YOLO_CONF_THRESHOLD: float = 0.8
    STRUCT_CONF_THRESHOLD: float = 0.9
    TABLE_CLASS_ID: int = 0
    X_CROP_PADDING: int = 10
    Y_CROP_PADDING: int = 2

    # Job retention (seconds)
    JOB_TTL: int = 3600

    # Hugging Face token for model downloads
    HF_TOKEN: str = ""

    # Google Cloud credentials
    GOOGLE_APPLICATION_CREDENTIALS: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure runtime directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
