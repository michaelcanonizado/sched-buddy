"""Utility functions for image processing and OCR."""

from __future__ import annotations

import io
from typing import Optional

from google.cloud import vision
from google.cloud.vision_v1 import types
from PIL import Image

from config import TESSERACT_CONFIG  # kept for JSON metadata output in inference.py

_vision_client = vision.ImageAnnotatorClient()

WordList = list[tuple[str, list[int]]]  # (text, [xmin, ymin, xmax, ymax])


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


def ocr_full_table(image: Image.Image) -> WordList:
    """Run Vision API once on the full table image.

    Returns a flat list of (word_text, [xmin, ymin, xmax, ymax]) pairs
    in document order (top-to-bottom, left-to-right).
    """
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    content = buffer.getvalue()

    image_obj = vision.Image(content=content)
    feature = types.Feature(type_=types.Feature.Type.DOCUMENT_TEXT_DETECTION)
    request = types.AnnotateImageRequest(image=image_obj, features=[feature])
    response = _vision_client.batch_annotate_images(requests=[request])
    
    if response.responses[0].error.message:
        raise RuntimeError(f"Vision API error: {response.responses[0].error.message}")

    words: WordList = []
    for page in response.responses[0].full_text_annotation.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    text = "".join(s.text for s in word.symbols)
                    verts = word.bounding_box.vertices
                    xs = [v.x for v in verts]
                    ys = [v.y for v in verts]
                    words.append((text, [min(xs), min(ys), max(xs), max(ys)]))
    return words


def collect_cell_text(
    words: WordList,
    cell_box: list[int],
    line_threshold: int = 10,
) -> str:
    """Gather words whose centre falls inside cell_box.

    Words are grouped into lines by y-proximity so that multi-line cells
    (e.g. Units sub-headers, multi-schedule rows) keep their newlines.
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