# SchedBuddy — Backend

FastAPI service that exposes the `ml/` inference pipeline over HTTP for the `web/` Next.js frontend.

---

## Monorepo layout

```
sched-buddy/
├── backend/          ← you are here
│   ├── main.py
│   ├── pipeline.py   ← wraps ml/ pipeline as a callable
│   ├── api/
│   │   └── routes.py
│   ├── core/
│   │   ├── config.py     ← all paths & thresholds
│   │   ├── schemas.py    ← Pydantic models
│   │   └── job_store.py  ← in-memory job tracker
│   ├── uploads/      ← temp upload storage (git-ignored)
│   ├── outputs/      ← per-job debug images + JSON (git-ignored)
│   ├── requirements.txt
│   └── .env.example
│
├── ml/               ← inference pipeline (unchanged)
│   ├── model.pt
│   ├── detector.py
│   ├── extraction.py
│   ├── config.py
│   └── ...
│
└── web/              ← Next.js frontend
    └── src/
        ├── lib/api.ts                    ← copy from backend/nextjs-client/
        └── hooks/useTableExtraction.ts   ← copy from backend/nextjs-client/
```

> `pipeline.py` adds `../ml/` to `sys.path` at runtime so `detector.py`,
> `extraction.py`, and `config.py` are importable without modifying `ml/`.

---

## Setup

### 1 — Install dependencies

```bash
cd sched-buddy/backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2 — Configure environment

```bash
cp .env.example .env
# Edit .env if you need non-default paths or thresholds
```

The defaults assume the standard monorepo layout above. The only thing
you may need to change is `ALLOWED_ORIGINS` when deploying to production.

### 3 — Start the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Interactive API docs: http://localhost:8000/docs

---

## API reference

| Method   | Endpoint                       | Description                                    |
|----------|--------------------------------|------------------------------------------------|
| `GET`    | `/api/v1/health`               | Liveness + model readiness                     |
| `POST`   | `/api/v1/extract`              | Upload image → `{ job_id }` (202 Accepted)     |
| `GET`    | `/api/v1/jobs/{job_id}`        | Poll job status and fetch results when done    |
| `GET`    | `/api/v1/jobs`                 | List all jobs                                  |
| `DELETE` | `/api/v1/jobs/{job_id}`        | Delete job record + output files               |
| `GET`    | `/api/v1/jobs/{job_id}/download` | Download extracted JSON file                 |

### Job lifecycle

```
POST /extract  →  { job_id, status: "pending" }
                        ↓  (background task)
                  status: "processing"
                        ↓
                  status: "done"    → result contains headers + rows
                  status: "failed"  → error contains the reason
```

### Example result payload

```json
{
  "job_id": "...",
  "status": "done",
  "result": {
    "image_file": "schedule.png",
    "ocr_config": "--oem 3 --psm 6",
    "headers": ["code", "subject", "units", "class", "days", "time", "room", "faculty"],
    "rows": [
      {
        "code": "NSTP 12",
        "subject": "CWTS/LTS/ROTC",
        "units": { "credit": 0.0, "lec": 3.0, "lab": 0.0 },
        "class": "BUCS-LTS-AM2",
        "schedules": [
          {
            "days": ["saturday"],
            "time": { "start": "13:00 PM", "end": "16:00 PM" },
            "room": "CS-04-203",
            "faculty": "SERRANO, K."
          }
        ]
      }
    ],
    "row_count": 1,
    "column_count": 8
  }
}
```

---

## Next.js integration

Copy the generated client files into your `web/` project:

```bash
cp backend/nextjs-client/lib/api.ts          web/src/lib/api.ts
cp backend/nextjs-client/hooks/useTableExtraction.ts  web/src/hooks/useTableExtraction.ts
```

Add to `web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Basic usage in a component:

```tsx
import { useTableExtraction } from "@/hooks/useTableExtraction";

export function UploadPage() {
  const { extract, phase, result, error } = useTableExtraction();

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && extract(e.target.files[0])}
      />
      {phase === "processing" && <p>Extracting schedule…</p>}
      {phase === "done" && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {phase === "error" && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}
```
