"""
pipeline.py
-----------
Wraps the ML inference stages into a single callable `run_pipeline(image_path)`
that returns an ExtractionResult.

Monorepo layout assumed:
    sched-buddy/
    ├── backend/   ← this file lives here
    └── ml/        ← detector.py, extraction.py, config.py, model.pt

Stages
  1. Preprocessing       — preprocess (ml/preprocess.py) → cleaned image
  2. Table Detection    — YOLOv11s (ml/model.pt)
  2. Table Cropping     — bounding-box crop from YOLO label
  3. Structure Detection — BorderlessTableDetector (ml/detector.py)
  4. Data Extraction    — extract_table (ml/extraction.py) → headers + rows
  5. Postprocessing     — serialize_row + validate_course_rows (ml/extraction.py)
"""

from __future__ import annotations

import json
import logging
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Optional

import cv2

from core.config import settings
from core.schemas import ExtractionResult

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Set up Google Cloud credentials before importing ml/ modules
# ---------------------------------------------------------------------------

if settings.GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.GOOGLE_APPLICATION_CREDENTIALS
    logger.debug("Set GOOGLE_APPLICATION_CREDENTIALS to: %s", settings.GOOGLE_APPLICATION_CREDENTIALS)

# ---------------------------------------------------------------------------
# Make ml/ importable — insert once at module load time
# ---------------------------------------------------------------------------

_ML_DIR = str(settings.ML_DIR)
if _ML_DIR not in sys.path:
    sys.path.insert(0, _ML_DIR)
    logger.debug("Added ml/ to sys.path: %s", _ML_DIR)

# ---------------------------------------------------------------------------
# Lazy-load the YOLO model so startup is fast and tests don't require GPU
# ---------------------------------------------------------------------------

_yolo_model = None


def _get_yolo():
    global _yolo_model
    if _yolo_model is None:
        from ultralytics import YOLO  # type: ignore
        logger.info("Loading YOLO model: %s", settings.MODEL_PATH)
        _yolo_model = YOLO(str(settings.MODEL_PATH))
        logger.info("YOLO model ready.")
    return _yolo_model


def is_model_ready() -> bool:
    """Return True if model.pt exists and loads without error."""
    if not settings.MODEL_PATH.exists():
        logger.warning("model.pt not found at %s", settings.MODEL_PATH)
        return False
    try:
        _get_yolo()
        return True
    except Exception as exc:
        logger.warning("Model load failed: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Core pipeline
# ---------------------------------------------------------------------------

def run_pipeline(image_path: Path, job_id: str) -> ExtractionResult:
    # Timing tracking
    t_start = time.perf_counter()
    timings = {}
    
    # ml/ modules — importable because _ML_DIR is in sys.path
    from preprocess import preprocess             # ml/preprocess.py
    from detector import BorderlessTableDetector  # ml/detector.py
    from extraction import extract_table          # ml/extraction.py
    from postprocess import serialize_row, validate_course_rows  # ml/extraction.py
    from models import TableData                  # ml/models.py
    
    t_import = time.perf_counter() - t_start
    timings['import'] = t_import

    # -----------------------------------------------------------------------
    # Per-job workspace inside backend/outputs/<job_id>/
    # -----------------------------------------------------------------------
    work_dir = settings.OUTPUT_DIR / job_id
    if work_dir.exists():
        shutil.rmtree(work_dir)
    work_dir.mkdir(parents=True, exist_ok=True)

    img_stem = image_path.stem
    img_suffix = image_path.suffix

    TABLE_OUTPUT_PATH = work_dir / f"table_{img_stem}.jpg"
    LABEL_PATH = work_dir / "labels" / f"{img_stem}.txt"
    CROPPED_OUTPUT_PATH = work_dir / f"cropped_{img_stem}.jpg"
    STRUCT_OUTPUT_PATH = work_dir / f"struct_{img_stem}.jpg"
    EXTRACTED_JSON_PATH = work_dir / f"extracted_{img_stem}.json"

    # -----------------------------------------------------------------------
    # Stage 1: Preprocessing
    # -----------------------------------------------------------------------

    preprocessed = preprocess(str(image_path))

    # -----------------------------------------------------------------------
    # Stage 2 — Table detection (YOLO)
    # -----------------------------------------------------------------------
    t_yolo_start = time.perf_counter()

    model = _get_yolo()

    t_yolo_load = time.perf_counter() - t_yolo_start
    
    results = model.predict(
        source=str(preprocessed.output_path),
        conf=settings.YOLO_CONF_THRESHOLD,
        save_txt=True,
        project=str(work_dir),
        name=".",
        exist_ok=True,
    )

    t_yolo_predict = time.perf_counter() - t_yolo_start - t_yolo_load
    timings['yolo_load'] = t_yolo_load
    timings['yolo_predict'] = t_yolo_predict
    
    results[0].save(str(TABLE_OUTPUT_PATH))

    logger.info(
        "[%s] YOLO done → %s (load=%.2fs, predict=%.2fs)",
        job_id, TABLE_OUTPUT_PATH, t_yolo_load, t_yolo_predict
    )

    # -----------------------------------------------------------------------
    # Stage 2b — Crop detected table region
    # -----------------------------------------------------------------------
    t_crop_start = time.perf_counter()

    image = cv2.imread(str(preprocessed.output_path))
    if image is None:
        raise RuntimeError(f"Cannot read YOLO output image: {preprocessed.output_path}")

    if not LABEL_PATH.exists():
        raise RuntimeError(
            "No table detected in this image — YOLO produced no label file. "
            f"Expected: {LABEL_PATH}"
        )

    height, width = image.shape[:2]
    raw_lines = LABEL_PATH.read_text(encoding="utf-8").splitlines()
    lines = [l.strip() for l in raw_lines if l.strip()]

    if not lines:
        raise RuntimeError("Label file is empty — no detections above confidence threshold.")

    parts = lines[0].split()
    if len(parts) < 5:
        raise RuntimeError(f"Malformed label line: {lines[0]!r}")

    cls_id = int(float(parts[0]))
    if cls_id != settings.TABLE_CLASS_ID:
        raise RuntimeError(
            f"Unexpected class ID {cls_id} (expected {settings.TABLE_CLASS_ID}). "
            "Is this a schedule document?"
        )

    x_center_n, y_center_n, w_n, h_n = map(float, parts[1:5])
    box_w, box_h = w_n * width, h_n * height
    x_center, y_center = x_center_n * width, y_center_n * height

    x_pad = settings.X_CROP_PADDING
    y_pad = settings.Y_CROP_PADDING
    x1 = max(0, int(round(x_center - box_w / 2)) - x_pad)
    y1 = max(0, int(round(y_center - box_h / 2)) - y_pad)
    x2 = min(width,  int(round(x_center + box_w / 2)) + x_pad)
    y2 = min(height, int(round(y_center + box_h / 2)) + y_pad)

    if x2 <= x1 or y2 <= y1:
        raise RuntimeError(f"Degenerate bounding box after crop: ({x1},{y1},{x2},{y2})")

    cropped = image[y1:y2, x1:x2]
    if cropped.size == 0:
        raise RuntimeError("Cropped region is empty.")

    cv2.imwrite(str(CROPPED_OUTPUT_PATH), cropped)

    timings['crop'] = time.perf_counter() - t_crop_start
    logger.info("[%s] Cropped table → %s (%.2fs)", job_id, CROPPED_OUTPUT_PATH, timings['crop'])

    # -----------------------------------------------------------------------
    # Stage 3 — Structure detection (Table Transformer)
    # -----------------------------------------------------------------------
    t_struct_start = time.perf_counter()

    detector = BorderlessTableDetector(
        image_path=CROPPED_OUTPUT_PATH,
        output_path=STRUCT_OUTPUT_PATH,
    )
    detector.load_image()
    detections, _ = detector.process(
        model_type="structure",
        threshold=settings.STRUCT_CONF_THRESHOLD,
        show_plot=False,
        save_plot=True,
    )

    timings['structure_detection'] = time.perf_counter() - t_struct_start
    logger.info(
        "[%s] Structure detection: %d regions (%.2fs)",
        job_id, len(detections), timings['structure_detection']
    )

    # -----------------------------------------------------------------------
    # Stage 4 — Data extraction (OCR + validation)
    # -----------------------------------------------------------------------
    t_extract_start = time.perf_counter()

    table_data = extract_table(detector, detections)

    timings['extraction'] = time.perf_counter() - t_extract_start
    logger.info(
        "[%s] Extraction done — %d headers, %d rows (%.2fs)",
        job_id, len(table_data.headers), len(table_data.rows), timings['extraction']
    )
    
    # -----------------------------------------------------------------------
    # Stage 5: Data postprocessing and validation
    # -----------------------------------------------------------------------
    t_postproc_start = time.perf_counter()

    # NOTE: UnitsHandler return a class breakdown dict, which fails CourseRow validation, so we serialize it before validation.
    serialized_row = [serialize_row(row) for row in table_data.rows]
    serialized_table_data = TableData(headers=table_data.headers, rows=serialized_row, cells=table_data.cells)
    
    normalized_table_data = validate_course_rows(table=serialized_table_data)

    timings['postprocessing'] = time.perf_counter() - t_postproc_start

    t_total = time.perf_counter() - t_start

    # -----------------------------------------------------------------------
    # Optional Stage: Data Export
    # -----------------------------------------------------------------------

    Path(EXTRACTED_JSON_PATH).write_text(
        json.dumps(
            {
                "image_file": str(image_path),
                "timings": timings,
                "total_time": t_total,
                "headers": normalized_table_data.headers,
                "rows": normalized_table_data.rows,
            },
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )
    print("Table JSON saved: %s" % EXTRACTED_JSON_PATH)


    logger.info("[%s] Postprocessing done (%.2fs)", job_id, timings['postprocessing'])

    # -----------------------------------------------------------------------
    # Total timing
    # -----------------------------------------------------------------------
    logger.info(
        "[%s] ✓ PIPELINE COMPLETE (%.2fs total) | "
        "yolo_load=%.2fs | yolo_predict=%.2fs | crop=%.2fs | "
        "structure=%.2fs | extraction=%.2fs | postproc=%.2fs",
        job_id, t_total,
        timings.get('yolo_load', 0),
        timings.get('yolo_predict', 0),
        timings.get('crop', 0),
        timings.get('structure_detection', 0),
        timings.get('extraction', 0),
        timings.get('postprocessing', 0),
    )

    return ExtractionResult(
        data=normalized_table_data.rows,
    )

