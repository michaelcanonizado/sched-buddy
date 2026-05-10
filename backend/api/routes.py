import time
import logging
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from core.config import settings
from core.job_store import job_store
from core.schemas import (
    ExtractionResult,
    HealthResponse,
    JobStatus,
    JobStatusResponse,
    SubmitResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Allowed image types
# ---------------------------------------------------------------------------
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/tiff", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}


# ---------------------------------------------------------------------------
# Background task — runs the pipeline outside the request/response cycle
# ---------------------------------------------------------------------------

def _run_pipeline_task(job_id: str, image_path: Path):
    from pipeline import run_pipeline

    job_store.update(job_id, status=JobStatus.PROCESSING, updated_at=time.time())
    try:
        result: ExtractionResult = run_pipeline(image_path, job_id)
        job_store.update(
            job_id,
            status=JobStatus.DONE,
            result=result,
            updated_at=time.time(),
        )
        logger.info("Job %s completed successfully.", job_id)
    except Exception as exc:
        logger.exception("Job %s failed: %s", job_id, exc)
        job_store.update(
            job_id,
            status=JobStatus.FAILED,
            error=str(exc),
            updated_at=time.time(),
        )
    finally:
        # Clean up the uploaded file after processing
        try:
            image_path.unlink(missing_ok=True)
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    """Liveness + model readiness check. Also reports whether ml/ directory is reachable."""
    from pipeline import is_model_ready
    return HealthResponse(
        status="ok",
        model_loaded=is_model_ready(),
        ml_dir_exists=settings.ML_DIR.exists(),
    )


@router.post(
    "/extract",
    response_model=SubmitResponse,
    status_code=202,
    tags=["Extraction"],
    summary="Upload an image and start table extraction",
)
async def submit_extraction(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Image file containing a table"),
):
    """
    Upload an image (JPEG, PNG, TIFF, WebP) and kick off the ML pipeline.

    Returns a **job_id** immediately. Poll `GET /api/v1/jobs/{job_id}` to
    track progress and retrieve results.
    """
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Accepted: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file extension '{suffix}'.",
        )

    # Persist upload
    job = job_store.create(filename=file.filename)
    upload_path = settings.UPLOAD_DIR / f"{job.job_id}{suffix}"
    try:
        content = await file.read()
        upload_path.write_bytes(content)
    except Exception as exc:
        job_store.delete(job.job_id)
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")

    # Queue background task
    background_tasks.add_task(_run_pipeline_task, job.job_id, upload_path)

    return SubmitResponse(
        job_id=job.job_id,
        status=JobStatus.PENDING,
        message="Job queued. Poll /jobs/{job_id} for status.",
    )


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    tags=["Extraction"],
    summary="Get extraction job status and results",
)
async def get_job_status(job_id: str):
    """
    Retrieve the current status of an extraction job.

    - **pending** — waiting to start
    - **processing** — pipeline is running
    - **done** — results are available in `result`
    - **failed** — check `error` for the reason
    """
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return JobStatusResponse(**job.model_dump())


@router.get(
    "/jobs",
    response_model=list[JobStatusResponse],
    tags=["Extraction"],
    summary="List all jobs",
)
async def list_jobs():
    """Return all jobs currently in the store (newest last)."""
    jobs = sorted(job_store.all(), key=lambda j: j.created_at)
    return [JobStatusResponse(**j.model_dump()) for j in jobs]


@router.delete(
    "/jobs/{job_id}",
    status_code=204,
    tags=["Extraction"],
    summary="Delete a job and its outputs",
)
async def delete_job(job_id: str):
    """Remove a job record and its associated output files."""
    import shutil

    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    job_store.delete(job_id)

    output_dir = settings.OUTPUT_DIR / job_id
    if output_dir.exists():
        shutil.rmtree(output_dir, ignore_errors=True)

    return  # 204 No Content


@router.get(
    "/jobs/{job_id}/download",
    tags=["Extraction"],
    summary="Download extracted JSON for a completed job",
)
async def download_result(job_id: str):
    """Download the raw extracted JSON file produced by the pipeline."""
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job.status != JobStatus.DONE:
        raise HTTPException(
            status_code=409,
            detail=f"Job is '{job.status}', not done yet.",
        )

    # Find the extracted JSON in the job output folder
    job_dir = settings.OUTPUT_DIR / job_id
    json_files = list(job_dir.glob("extracted_*.json"))
    if not json_files:
        raise HTTPException(status_code=404, detail="Output file not found on disk.")

    return FileResponse(
        path=str(json_files[0]),
        media_type="application/json",
        filename=json_files[0].name,
    )
