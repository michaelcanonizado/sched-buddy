/**
 * lib/transformSchedule.ts
 * ------------------------
 * Converts the backend ExtractionResult into the Subject[] shape
 * expected by the timetable UI.
 *
 * Drop into: src/lib/transformSchedule.ts
 */

import type { Subject, Day } from "../features/schedule/types";
import type { ExtractionResult, CourseRow } from "./api";

// ---------------------------------------------------------------------------
// Color palette — matches the pastel tones in mock-data.ts
// Cycles through if there are more subjects than colors.
// ---------------------------------------------------------------------------
const COLORS = [
  "#FFE37D",
  "#C8F7C5",
  "#E08283",
  "#99CCCC",
  "#CC99CC",
  "#F7B891",
  "#FFDDFF",
  "#AED6F1",
  "#A9DFBF",
  "#F9E79F",
];

// ---------------------------------------------------------------------------
// Derive meeting type from unit breakdown or context
// ---------------------------------------------------------------------------

function deriveMeetingType(
  row: CourseRow,
  scheduleIndex: number
): string | undefined {
  const units = row.units;
  if (!units || typeof units === "number") return undefined;

  // If a subject has multiple schedules, heuristically label them
  const schedules = row.schedules ?? [];
  if (schedules.length <= 1) return undefined;

  if (scheduleIndex === 0 && units.lec > 0) return "Lecture";
  if (scheduleIndex === 1 && units.lab > 0) return "Lab";
  return undefined;
}

// ---------------------------------------------------------------------------
// Main transform
// ---------------------------------------------------------------------------

/**
 * Convert a backend ExtractionResult into the Subject[] array the
 * timetable component expects.
 *
 * @param result  - ExtractionResult from GET /api/v1/jobs/{job_id}
 * @returns       - Subject[] ready to pass to the timetable UI
 */
export function transformToSubjects(result: ExtractionResult): Subject[] {
  return result.rows.map((row: CourseRow, rowIndex: number) => {
    const color = COLORS[rowIndex % COLORS.length];

    const meetings = (row.schedules ?? []).map((schedule, scheduleIndex) => ({
      id: crypto.randomUUID(),
      days: (schedule.days ?? []) as Day[],
      startTime: Number(schedule.time?.start ?? 0),
      endTime: Number(schedule.time?.end ?? 0),
      type: deriveMeetingType(row, scheduleIndex),
      instructor: schedule.faculty ?? "",
      location: schedule.room ?? undefined,
    }));

    return {
      id: crypto.randomUUID(),
      title: row.subject ?? row.code ?? "Unknown Subject",
      color,
      meetings,
    } satisfies Subject;
  });
}