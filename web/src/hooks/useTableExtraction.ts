/**
 * hooks/useTableExtraction.ts
 * ---------------------------
 * Manages the full upload → poll → transform lifecycle.
 * Returns both the raw ExtractionResult and the transformed Subject[]
 * ready for the timetable UI.
 *
 * Drop into: src/hooks/useTableExtraction.ts
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { submitExtraction, pollJob, type Job, type ExtractionResult, ApiError } from "@/lib/api";
import { transformToSubjects } from "@/lib/transformSchedule";
import type { Subject } from "@/features/schedule/types";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";

interface UseTableExtractionReturn {
  extract: (file: File) => Promise<void>;
  /** Transformed subjects — pass directly to your timetable component */
  subjects: Subject[];
  /** Raw backend result, if you need the original data too */
  rawResult: ExtractionResult | null;
  job: Job | null;
  phase: Phase;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useTableExtraction(): UseTableExtractionReturn {
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rawResult, setRawResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortedRef = useRef(false);

  const reset = useCallback(() => {
    abortedRef.current = true;
    setPhase("idle");
    setJob(null);
    setSubjects([]);
    setRawResult(null);
    setError(null);
    setTimeout(() => { abortedRef.current = false; }, 0);
  }, []);

  const extract = useCallback(async (file: File) => {
    abortedRef.current = false;
    setPhase("uploading");
    setJob(null);
    setSubjects([]);
    setRawResult(null);
    setError(null);

    try {
      const submission = await submitExtraction(file);
      if (abortedRef.current) return;

      setPhase("processing");

      const finalJob = await pollJob(
        submission.job_id,
        (updated) => { if (!abortedRef.current) setJob(updated); },
      );

      if (abortedRef.current) return;

      setJob(finalJob);

      if (finalJob.result) {
        setRawResult(finalJob.result);
        setSubjects(transformToSubjects(finalJob.result));
      }

      setPhase("done");
    } catch (err) {
      if (abortedRef.current) return;
      setError(err instanceof ApiError ? err.message : String(err));
      setPhase("error");
    }
  }, []);

  return { extract, subjects, rawResult, job, phase, isLoading: phase === "uploading" || phase === "processing", error, reset };
}