from __future__ import annotations

import time
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


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
# Schedule domain models — mirror the ml/ output format
# ---------------------------------------------------------------------------

class UnitBreakdown(BaseModel):
    credit: float = 0.0
    lec: float = 0.0
    lab: float = 0.0


class TimeRange(BaseModel):
    start: str = Field(..., examples=["07:30 AM"])
    end: str = Field(..., examples=["09:00 AM"])


class Schedule(BaseModel):
    days: List[str] = Field(default_factory=list, examples=[["monday", "wednesday"]])
    time: Optional[TimeRange] = None
    room: Optional[str] = None
    faculty: Optional[str] = None


class CourseRow(BaseModel):
    code: Optional[str] = None
    subject: Optional[str] = None
    units: Optional[Union[UnitBreakdown, float]] = None
    class_section: Optional[str] = Field(None, alias="class")
    schedules: List[Schedule] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


# ---------------------------------------------------------------------------
# Top-level extraction result
# ---------------------------------------------------------------------------

class ExtractionResult(BaseModel):
    image_file: str = Field(..., description="Original uploaded filename")
    ocr_config: str = Field(..., description="Tesseract OCR configuration used")
    headers: List[str] = Field(
        default_factory=list,
        description="Detected column headers (e.g. code, subject, units, …)",
        examples=[["code", "subject", "units", "class", "days", "time", "room", "faculty"]],
    )
    rows: List[Any] = Field(
        default_factory=list,
        description="Extracted course rows. Each item is a CourseRow-shaped dict.",
    )
    row_count: int = Field(0, description="Number of course rows extracted")
    column_count: int = Field(0, description="Number of columns detected")


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

