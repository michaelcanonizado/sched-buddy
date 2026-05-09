/**
 * lib/api.ts
 * ----------
 * Typed API client for the SchedBuddy FastAPI backend.
 * Drop this file into: src/lib/api.ts
 *
 * Set NEXT_PUBLIC_API_URL in .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ---------------------------------------------------------------------------
// Domain types — mirror backend/core/schemas.py
// ---------------------------------------------------------------------------

export type JobStatus = "pending" | "processing" | "done" | "failed";

export interface UnitBreakdown {
  credit: number;
  lec: number;
  lab: number;
}

export interface TimeRange {
  start: string; // e.g. "07:30 AM"
  end: string;   // e.g. "09:00 AM"
}

export interface CourseSchedule {
  days: string[];        // e.g. ["monday", "wednesday"]
  time: TimeRange | null;
  room: string | null;
  faculty: string | null;
}

export interface CourseRow {
  code: string | null;
  subject: string | null;
  units: UnitBreakdown | number | null;
  class: string | null;
  schedules: CourseSchedule[];
}

export interface ExtractionResult {
  image_file: string;
  ocr_config: string;
  headers: string[];   // e.g. ["code","subject","units","class","days","time","room","faculty"]
  rows: CourseRow[];
  row_count: number;
  column_count: number;
}

export interface Job {
  job_id: string;
  status: JobStatus;
  filename: string;
  created_at: number;
  updated_at: number | null;
  error: string | null;
  result: ExtractionResult | null;
}

export interface SubmitResponse {
  job_id: string;
  status: JobStatus;
  message: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  ml_dir_exists: boolean;
  version: string;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Unknown error");
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/** Check backend liveness and whether the ML model is loaded. */
export async function checkHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

/**
 * Upload a schedule document image and start the extraction pipeline.
 * Returns immediately with a job_id — poll `getJob` for results.
 */
export async function submitExtraction(file: File): Promise<SubmitResponse> {
  const form = new FormData();
  form.append("file", file);

  // Do NOT set Content-Type — browser sets multipart boundary automatically
  const res = await fetch(`${BASE_URL}/extract`, { method: "POST", body: form });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Upload failed");
  }

  return res.json() as Promise<SubmitResponse>;
}

/** Get the current status (and result when done) of an extraction job. */
export async function getJob(jobId: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/${jobId}`);
}

/** List all jobs in the backend store. */
export async function listJobs(): Promise<Job[]> {
  return apiFetch<Job[]>("/jobs");
}

/** Delete a job and all its output files from the backend. */
export async function deleteJob(jobId: string): Promise<void> {
  await apiFetch<void>(`/jobs/${jobId}`, { method: "DELETE" });
}

/** Returns the URL to download a completed job's raw JSON output. */
export function getDownloadUrl(jobId: string): string {
  return `${BASE_URL}/jobs/${jobId}/download`;
}

// ---------------------------------------------------------------------------
// Polling utility
// ---------------------------------------------------------------------------

/**
 * Poll a job until it reaches a terminal state (`done` | `failed`).
 *
 * @param jobId       Job to watch
 * @param onUpdate    Called with the latest Job on every poll tick
 * @param intervalMs  Poll interval in ms (default 2000)
 * @param timeoutMs   Abort after this many ms (default 5 min)
 */
export async function pollJob(
  jobId: string,
  onUpdate: (job: Job) => void,
  intervalMs = 2_000,
  timeoutMs = 300_000,
): Promise<Job> {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const tick = async () => {
      if (Date.now() > deadline) {
        return reject(new Error(`Job ${jobId} timed out after ${timeoutMs / 1000}s`));
      }
      try {
        const job = await getJob(jobId);
        onUpdate(job);
        if (job.status === "done")   return resolve(job);
        if (job.status === "failed") return reject(new ApiError(500, job.error ?? "Pipeline failed"));
        setTimeout(tick, intervalMs);
      } catch (err) {
        reject(err);
      }
    };
    tick();
  });
}
