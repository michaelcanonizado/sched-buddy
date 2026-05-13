import z from 'zod'

const courseUnitSchema = z.object({
  credit: z.number(),
  lec: z.number(),
  lab: z.number(),
})
export type CourseUnit = z.infer<typeof courseUnitSchema>

const courseTimeSchema = z.object({
  start: z.number(),
  end: z.number(),
})
export type CourseTime = z.infer<typeof courseTimeSchema>

const courseScheduleSchema = z.object({
  /* Must be forced to an enum because matching to a col will happen */
  days: z.array(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  ),
  time: courseTimeSchema,
  room: z.union([z.string(), z.null()]),
  faculty: z.union([z.string(), z.null()]),
})
export type CourseSchedule = z.infer<typeof courseScheduleSchema>

const courseRowSchema = z.object({
  code: z.union([z.string(), z.null()]),
  subject: z.union([z.string(), z.null()]),
  units: z.union([courseUnitSchema, z.number(), z.null()]),
  class: z.union([z.string(), z.null()]),
  schedules: z.array(courseScheduleSchema),
})
export type CourseRow = z.infer<typeof courseRowSchema>

const extractionResultSchema = z.object({
  data: z.array(courseRowSchema),
})
export type ExtractionResult = z.infer<typeof extractionResultSchema>

export const jobStatusSchema = z.enum(['pending', 'processing', 'done', 'failed'])
export type JobStatus = z.infer<typeof jobStatusSchema>

export const jobSchema = z.object({
  job_id: z.string(),
  status: jobStatusSchema,
  filename: z.string(),
  created_at: z.number(),
  updated_at: z.union([z.number(), z.null()]),
  error: z.union([z.string(), z.null()]),
  result: z.union([extractionResultSchema, z.null()]),
})
export type Job = z.infer<typeof jobSchema>

export const jobsSchema = z.array(jobSchema)
export type Jobs = z.infer<typeof jobsSchema>

export const submitResponseSchema = z.object({
  job_id: z.string(),
  status: jobStatusSchema,
  message: z.string(),
})
export type SubmitResponse = z.infer<typeof submitResponseSchema>

export const healthResponseSchema = z.object({
  status: z.string(),
  model_loaded: z.boolean(),
  ml_dir_exists: z.boolean(),
  version: z.string(),
})
export type HealthResponse = z.infer<typeof healthResponseSchema>
