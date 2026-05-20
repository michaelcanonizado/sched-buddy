"""
Pipeline stages:
    0. Normalize    — convert PDF/image to an RGB numpy array
    1. Quality gates — resolution and sharpness checks
    2. Perspective  — detect document quad and warp to a flat, front-on view
    3. Deskew       — correct any residual small tilt after perspective correction
    4. Enhance      — CLAHE lighting correction + adaptive threshold for dark images
"""

from __future__ import annotations

import logging
import sys
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import fitz  # PyMuPDF
import numpy as np
from jdeskew.estimator import get_angle
from PIL import Image, ImageOps
from scipy.ndimage import rotate

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS: frozenset[str] = frozenset(
    {".jpg", ".jpeg", ".jfif", ".png", ".pdf"}
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

@dataclass
class PreprocessingConfig:
    # Resolution gates
    min_pixels:             int             = 400_000
    max_pixels:             int             = 100_000_000
    blur_threshold:         float           = 25.0
    # Perspective correction
    perspective_enabled:    bool            = True
    perspective_min_area:   float           = 0.20
    perspective_max_area:   float           = 0.92
    perspective_edge_strip: int             = 8
    perspective_edge_bright: int            = 220
    perspective_edge_var:   float           = 200.0
    perspective_pad:        int             = 10
    bilateral_d:            int             = 9
    bilateral_sigma:        int             = 75
    canny_low:              int             = 50
    canny_high:             int             = 150
    contour_epsilon:        float           = 0.02
    # Deskew
    deskew_enabled:         bool            = True
    deskew_min_angle:       float           = 0.
    deskew_max_angle:       float           = 10.0
    # OCR enhancement
    darkness_threshold:     int             = 130
    clahe_clip:             float           = 2.0
    clahe_tile_auto:        bool            = True
    clahe_tile:             tuple[int, int] = (8, 8)
    # I/O
    pdf_scale:              float           = 2.0
    output_dir:             Path            = field(default_factory=lambda: Path("outputs"))


# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

@dataclass
class PreprocessingResult:
    output_path:   Path
    steps_applied: list[str]
    warnings:      list[str]

# ---------------------------------------------------------------------------
# Stage 0: Normalise input -> RGB ndarray
# ---------------------------------------------------------------------------

def _load_pdf(path: Path, scale: float) -> np.ndarray:
    doc = fitz.open(str(path))
    try:
        matrix = fitz.Matrix(scale, scale)
        pix = doc[0].get_pixmap(matrix=matrix, colorspace=fitz.csRGB)
    finally:
        doc.close()
    return np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 3)

def _load_image(path: Path) -> np.ndarray:
    img = Image.open(path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    return np.array(img)

def _normalize_input(path: Path, pdf_scale: float) -> np.ndarray:
    if path.suffix.lower() == ".pdf":
        return _load_pdf(path, pdf_scale)
    return _load_image(path)

# ---------------------------------------------------------------------------
# Stage 1: Quality gates
# ---------------------------------------------------------------------------

def _check_resolution(img: np.ndarray, min_pixels: int, max_pixels: int) -> None:
    h, w = img.shape[:2]
    total = h * w
    if total < min_pixels:
        raise ValueError(
            f"Image resolution too low: {w}x{h} = {total:,} px "
            f"(minimum {min_pixels:,} px). Please use a higher-quality scan."
        )
    if total > max_pixels:
        raise ValueError(
            f"Image resolution too high: {w}x{h} = {total:,} px "
            f"(maximum {max_pixels:,} px). Downscale the image before processing."
        )


def _check_sharpness(gray: np.ndarray, threshold: float) -> str | None:
    # Return a warning string if the image appears blurry, else None.
 
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    logger.debug("Sharpness (Laplacian variance): %.2f", variance)
    if variance < threshold:
        return (
            f"Image may be blurry (Laplacian variance {variance:.1f} < {threshold}). "
            "OCR accuracy may be reduced."
        )
    return None


# ---------------------------------------------------------------------------
# Stage 2: Perspective correction
# ---------------------------------------------------------------------------

def _order_corners(pts: np.ndarray) -> np.ndarray:
    """Order four corner points as [top-left, top-right, bottom-right, bottom-left].
    Uses the sum/difference trick:
        top-left     -> smallest (x + y)
        bottom-right -> largest  (x + y)
        top-right    -> smallest (y - x)
        bottom-left  -> largest  (y - x)
    """
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]           # top-left
    rect[2] = pts[np.argmax(s)]           # bottom-right
    diff = np.diff(pts, axis=1).ravel()
    rect[1] = pts[np.argmin(diff)]        # top-right
    rect[3] = pts[np.argmax(diff)]        # bottom-left
    return rect


def _detect_document_quad(
    img_rgb: np.ndarray,
    min_area_ratio: float,
    max_area_ratio: float,
    bilateral_d: int = 9,
    bilateral_sigma: int = 75,
    canny_low: int = 50,
    canny_high: int = 150,
    contour_epsilon: float = 0.02,
) -> np.ndarray | None:

    h, w = img_rgb.shape[:2]
    image_area = h * w

    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    blurred = cv2.bilateralFilter(
        gray, d=bilateral_d, sigmaColor=bilateral_sigma, sigmaSpace=bilateral_sigma
    )

    edges = cv2.Canny(blurred, threshold1=canny_low, threshold2=canny_high)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    edges = cv2.dilate(edges, kernel, iterations=2)

    contours, _ = cv2.findContours(
        edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    if not contours:
        logger.debug("Perspective: no contours found.")
        return None

    for contour in sorted(contours, key=cv2.contourArea, reverse=True)[:5]:
        area = cv2.contourArea(contour)
        if area < min_area_ratio * image_area:
            break 

        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, contour_epsilon * peri, True)

        if len(approx) == 4:
            area_ratio = area / image_area
            if area_ratio > max_area_ratio:
                logger.info(
                    "Perspective: quad covers %.1f%% of image (max %.0f%%) — "
                    "looks like the image border, not a document boundary. "
                    "Skipping perspective correction (likely a flat scan).",
                    100.0 * area_ratio, 100.0 * max_area_ratio,
                )
                return None
            corners = approx.reshape(4, 2).astype(np.float32)
            logger.debug(
                "Perspective: quad found (area %.1f%% of image).",
                100.0 * area_ratio,
            )
            return _order_corners(corners)

    logger.debug("Perspective: no quadrilateral contour found.")
    return None


def _warp_perspective(
    img_rgb: np.ndarray,
    corners: np.ndarray,
    pad: int,
) -> np.ndarray:

    tl, tr, br, bl = corners

    # Width = longest of top/bottom edges; height = longest of left/right edges
    width = int(max(
        np.linalg.norm(tr - tl),
        np.linalg.norm(br - bl),
    ))
    height = int(max(
        np.linalg.norm(bl - tl),
        np.linalg.norm(br - tr),
    ))

    dst = np.array(
        [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]],
        dtype=np.float32,
    )

    M = cv2.getPerspectiveTransform(corners, dst)
    warped = cv2.warpPerspective(
        img_rgb, M, (width, height),
        flags=cv2.INTER_LANCZOS4,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(255, 255, 255),
    )

    if pad > 0:
        warped = cv2.copyMakeBorder(
            warped, pad, pad, pad, pad,
            cv2.BORDER_CONSTANT, value=(255, 255, 255),
        )

    return warped



def _is_full_frame_scan(
    gray: np.ndarray,
    edge_strip: int = 8,
    brightness_threshold: int = 220,
    variance_threshold: float = 200.0,
) -> bool:

    h, w = gray.shape[:2]
    s = min(edge_strip, h // 8, w // 8)
    gray = gray.astype(np.float32)

    strips = {
        "top":    gray[:s,    :   ],
        "bottom": gray[h-s:,  :   ],
        "left":   gray[:,     :s  ],
        "right":  gray[:,     w-s:],
    }

    for name, strip in strips.items():
        mean = strip.mean()
        var  = strip.var()
        logger.debug("Edge strip %s: mean=%.1f, var=%.1f", name, mean, var)
        if mean < brightness_threshold or var > variance_threshold:
            logger.debug(
                "Edge '%s' failed (mean=%.1f, var=%.1f) -> background detected -> camera photo.",
                name, mean, var,
            )
            return False

    logger.info(
        "All four edge strips are bright and uniform -> full-frame scan detected. "
        "Skipping perspective correction."
    )
    return True


def _correct_perspective(
    img_rgb: np.ndarray,
    gray: np.ndarray,
    min_area_ratio: float,
    max_area_ratio: float,
    edge_strip: int,
    edge_bright: int,
    edge_var: float,
    bilateral_d: int,
    bilateral_sigma: int,
    canny_low: int,
    canny_high: int,
    contour_epsilon: float,
    pad: int,
) -> tuple[np.ndarray, bool]:

    if _is_full_frame_scan(gray, edge_strip, edge_bright, edge_var):
        return img_rgb, False

    corners = _detect_document_quad(
        img_rgb, min_area_ratio, max_area_ratio,
        bilateral_d, bilateral_sigma, canny_low, canny_high, contour_epsilon,
    )
    if corners is None:
        logger.info("Perspective correction skipped: no document quad detected.")
        return img_rgb, False

    warped = _warp_perspective(img_rgb, corners, pad)
    logger.info(
        "Perspective corrected: %dx%d -> %dx%d",
        img_rgb.shape[1], img_rgb.shape[0],
        warped.shape[1], warped.shape[0],
    )
    return warped, True


# ---------------------------------------------------------------------------
# Stage 3: Deskew
# ---------------------------------------------------------------------------

def _deskew(
    img_rgb: np.ndarray,
    min_angle: float,
    max_angle: float,
) -> tuple[np.ndarray, bool]:

    angle = get_angle(img_rgb)
    logger.debug("Detected skew angle: %.4f degrees", angle)

    if abs(angle) < min_angle:
        logger.debug("Skew %.4f degrees below min (%.1f degrees). Skipping.", angle, min_angle)
        return img_rgb, False

    if abs(angle) > max_angle:
        logger.warning(
            "Skew angle %.2f degrees exceeds max (%.1f degrees) — likely a jdeskew "
            "misdetection. Skipping to avoid flipping the image.",
            angle, max_angle,
        )
        return img_rgb, False

    logger.info("Deskewing: rotating %.4f degrees", angle)
    rotated = rotate(img_rgb, angle, reshape=True, cval=255)
    return np.clip(rotated, 0, 255).astype(np.uint8), True


# ---------------------------------------------------------------------------
# Stage 4: OCR enhancement
# ---------------------------------------------------------------------------

def _auto_clahe_tile(img_rgb: np.ndarray, target_tile_px: int = 128) -> tuple[int, int]:
    h, w = img_rgb.shape[:2]
    rows = max(4, min(64, round(h / target_tile_px)))
    cols = max(4, min(64, round(w / target_tile_px)))
    return rows, cols


def _apply_clahe(
    img_rgb: np.ndarray,
    clip: float,
    tile: tuple[int, int],
    tile_auto: bool = True,
) -> np.ndarray:
    effective_tile = _auto_clahe_tile(img_rgb) if tile_auto else tile
    logger.debug("CLAHE tile grid: %s (auto=%s)", effective_tile, tile_auto)
    lab = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=effective_tile)
    enhanced = cv2.merge([clahe.apply(l_ch), a_ch, b_ch])
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)


def _apply_adaptive_threshold(img_rgb: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=41,
        C=10,
    )
    return cv2.cvtColor(binary, cv2.COLOR_GRAY2RGB)


def _enhance_for_ocr(
    img_rgb: np.ndarray,
    gray: np.ndarray,
    darkness_threshold: int,
    clahe_clip: float,
    clahe_tile: tuple[int, int],
    clahe_tile_auto: bool,
) -> tuple[np.ndarray, str]:
    gray_mean = gray.mean()
    logger.debug("Grayscale mean brightness: %.1f", gray_mean)

    if gray_mean < darkness_threshold:
        logger.info(
            "Dark image (mean=%.1f < %d). Applying adaptive thresholding.",
            gray_mean, darkness_threshold,
        )
        return _apply_adaptive_threshold(img_rgb), "adaptive_threshold"

    logger.info("Applying CLAHE (clip=%.1f, tile_auto=%s).", clahe_clip, clahe_tile_auto)
    return _apply_clahe(img_rgb, clahe_clip, clahe_tile, clahe_tile_auto), "clahe"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def preprocess(
    input_path: str | Path,
    config: PreprocessingConfig | None = None,
) -> PreprocessingResult:
    
    cfg = config or PreprocessingConfig()
    p = Path(input_path)

    if not p.exists():
        raise FileNotFoundError(f"Input file not found: {p}")
    if p.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type: '{p.suffix}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    steps_applied: list[str] = []
    warnings:      list[str] = []

    # Stage 0 — Load
    logger.info("Loading: %s", p.name)
    img = _normalize_input(p, cfg.pdf_scale)

    # Stage 1 — Quality gates
    # Compute grayscale once here; reused by sharpness check and scan detection.
    _check_resolution(img, cfg.min_pixels, cfg.max_pixels)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    blur_warning = _check_sharpness(gray, cfg.blur_threshold)
    if blur_warning:
        logger.warning(blur_warning)
        warnings.append(blur_warning)

    # Stage 2 — Perspective correction
    # gray is passed in so _is_full_frame_scan skips its own RGB→Gray conversion.
    if cfg.perspective_enabled:
        img, was_corrected = _correct_perspective(
            img,
            gray,
            cfg.perspective_min_area,
            cfg.perspective_max_area,
            cfg.perspective_edge_strip,
            cfg.perspective_edge_bright,
            cfg.perspective_edge_var,
            cfg.bilateral_d,
            cfg.bilateral_sigma,
            cfg.canny_low,
            cfg.canny_high,
            cfg.contour_epsilon,
            cfg.perspective_pad,
        )
        if was_corrected:
            steps_applied.append("perspective")

    # Stage 3 — Deskew (handles residual tilt after perspective warp)
    if cfg.deskew_enabled:
        img, was_deskewed = _deskew(img, cfg.deskew_min_angle, cfg.deskew_max_angle)
        if was_deskewed:
            steps_applied.append("deskewed")

    # Stage 4 — Enhance
    # Recompute gray after perspective/deskew transforms (image may have changed).
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    img, enhancement_step = _enhance_for_ocr(
        img,
        gray,
        cfg.darkness_threshold,
        cfg.clahe_clip,
        cfg.clahe_tile,
        cfg.clahe_tile_auto,
    )
    steps_applied.append(enhancement_step)

    out_dir = cfg.output_dir / p.stem
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{p.stem}.jpg"

    Image.fromarray(img).save(str(out_path))
    logger.info("Preprocessed image saved: %s", out_path)
    logger.info("Steps applied: %s", steps_applied if steps_applied else "none")
    if warnings:
        logger.warning("Warnings: %s", warnings)

    return PreprocessingResult(
        output_path=out_path,
        steps_applied=steps_applied,
        warnings=warnings,
    )