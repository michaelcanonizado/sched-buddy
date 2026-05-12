from __future__ import annotations

import sys
import time
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

# Import settings first to get the repo root and ml dir, then add both to sys.path
from core.config import settings

# Add both the workspace root and ml/ to sys.path
_REPO_ROOT = str(settings.REPO_ROOT)
_ML_DIR = str(settings.ML_DIR)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)
if _ML_DIR not in sys.path:
    sys.path.insert(0, _ML_DIR)

# Now import from ml
from ml.models import CourseRow

# ---------------------------------------------------------------------------
# Job lifecycle
# ---------------------------------------------------------------------------

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class Job(BaseModel):
    job_id: str
    status: JobStatus
    filename: str
    created_at: float = Field(default_factory=time.time)
    updated_at: Optional[float] = None
    error: Optional[str] = None
    result: Optional[ExtractionResult] = None

# ---------------------------------------------------------------------------
# Top-level extraction result
# ---------------------------------------------------------------------------

class ExtractionResult(BaseModel):
    data: List[CourseRow] = Field(
        default_factory=list,
        description="Extracted course rows. Each item is a CourseRow-shaped dict.",
    )

# ---------------------------------------------------------------------------
# API responses
# ---------------------------------------------------------------------------

class SubmitResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str = "Job queued successfully."


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    filename: str
    created_at: float
    updated_at: Optional[float] = None
    error: Optional[str] = None
    result: Optional[ExtractionResult] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
    ml_dir_exists: bool
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None


# ---------------------------------------------------------------------------
# Forward-ref resolution
# ---------------------------------------------------------------------------
Job.model_rebuild()

