"""Utility functions for image processing and OCR."""

from __future__ import annotations

from typing import Optional

from PIL import Image
from surya.detection import DetectionPredictor
from surya.foundation import FoundationPredictor
from surya.recognition import RecognitionPredictor

# Load once at module level — expensive, don't reload per call
_foundation_predictor = FoundationPredictor()
_rec_predictor = RecognitionPredictor(_foundation_predictor)
_det_predictor = DetectionPredictor()

LineList = list[tuple[str, list[int]]]  # (text, [xmin, ymin, xmax, ymax])


def bbox_intersection(
    box_a: list[float], box_b: list[float]
) -> Optional[list[int]]:
    """Return integer intersection of two [xmin, ymin, xmax, ymax] boxes or None."""
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])
    if x2 <= x1 or y2 <= y1:
        return None
    return [int(round(c)) for c in (x1, y1, x2, y2)]


def ocr_full_table(image: Image.Image) -> LineList:
    """Run Surya OCR once on the full table image.

    Returns a list of (line_text, [xmin, ymin, xmax, ymax]) pairs.
    """
    predictions = _rec_predictor([image], det_predictor=_det_predictor)
    lines: LineList = []
    for line in predictions[0].text_lines:
        if line.text.strip():
            bbox = [int(round(c)) for c in line.bbox]
            lines.append((line.text, bbox))
    return lines


def collect_cell_text(
    words: LineList,
    cell_box: list[int],
    line_threshold: int = 10,
) -> str:
    """Collect OCR lines whose centre falls inside cell_box.

    Lines are grouped by y-proximity to reconstruct newlines for
    multi-line cells (e.g. Units sub-headers, multi-schedule rows).
    """
    xmin, ymin, xmax, ymax = cell_box
    in_cell: list[tuple[int, int, str]] = []

    for text, (wx1, wy1, wx2, wy2) in words:
        cx = (wx1 + wx2) / 2
        cy = (wy1 + wy2) / 2
        if xmin <= cx <= xmax and ymin <= cy <= ymax:
            in_cell.append((wy1, wx1, text))

    if not in_cell:
        return ""

    in_cell.sort()  # top-to-bottom, left-to-right

    lines: list[list[tuple[int, int, str]]] = [[in_cell[0]]]
    for item in in_cell[1:]:
        if abs(item[0] - lines[-1][-1][0]) <= line_threshold:
            lines[-1].append(item)
        else:
            lines.append([item])

    return "\n".join(" ".join(w[2] for w in line) for line in lines)