from pathlib import Path
import json
import shutil
import sys

import cv2

import logging 
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def run_pipeline(img_path: Path):

    # Paths 
    base_dir = Path(__file__).resolve().parent

    OUTPUT_DIR  = base_dir / "output" / f"{img_path.stem}"

    # Remove old output if it exists
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    TABLE_OUTPUT = OUTPUT_DIR / f"table_{img_path.stem}.jpg"
    LABEL_PATH = OUTPUT_DIR / "labels" / f"{img_path.stem}.txt"
    CROPPED_OUTPUT = OUTPUT_DIR / f"cropped_{img_path.stem}.jpg"
    STRUCT_OUTPUT = OUTPUT_DIR / f"struct_{img_path.stem}.jpg"
    EXTRACTED_JSON = OUTPUT_DIR / f"extracted_{img_path.stem}.json"

    # -----------------------------------------------------------------------------
    # Stage 1: Preprocessing
    # -----------------------------------------------------------------------------
    from preprocess import preprocess

    preprocessed_path = preprocess(str(img_path))

    # -----------------------------------------------------------------------------
    # Stage 2: Table Detection
    # -----------------------------------------------------------------------------

    from ultralytics import YOLO

    model = YOLO("model.pt")

    # Run inference
    results = model.predict(
        source=preprocessed_path,
        conf=0.8, 
        save_txt=True, 
        project=str(OUTPUT_DIR),
        name=".",
        exist_ok=True)

    results[0].save(str(TABLE_OUTPUT))    

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python inference.py path/to/image.jpg")
        sys.exit(1)

    img_path = Path(sys.argv[1])
    if not img_path.exists():
        print(f"File not found: {img_path}")
        sys.exit(1)

    run_pipeline(img_path)