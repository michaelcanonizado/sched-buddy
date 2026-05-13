import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useJobCreationMutation } from './use-job-creation-mutation'
import jobPollQueryOptions from '../query-options/job-poll-query-options'
import { apiDELETE, ApiError } from '../lib/api'
import type { ExtractionResult, Job } from '../schemas'

/**
 * Public states of the hook: a combination of current phase + job.status.
 * Its not written as: Status = JobStatus & Phase to keep this status
 * decoupled from thee backend status. It checks job.status and thee current
 * state of the hook and infers its own state
 * */
export type Status = 'idle' | 'uploading' | 'processing' | 'done' | 'error'
/**
 * Local subset of Status
 */
type Phase = Exclude<Status, 'done' | 'error'>

type UseCORExtractionReturn = {
  extract: (file: File) => Promise<void>
  data: ExtractionResult | null
  job: Job | null
  status: Status
  isLoading: boolean
  isError: boolean
  error: string | null
  reset: () => Promise<void>
}

const POLL_TIMEOUT_MS = 5 * 60 * 1000

export function useCORExtraction(): UseCORExtractionReturn {
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState<Phase>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /*
   * Ref-based guard so extract() always reads the latest in-progress state
   * without needing it as a useCallback dependency.
   */
  const isInProgressRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutateAsync: createJob } = useJobCreationMutation()

  const { data: polledJob, isLoading: isPolling } = useQuery(
    jobPollQueryOptions(
      jobId,
      /* Only poll after job creation */
      { enabled: phase === 'processing' && !!jobId },
    ),
  )

  /* Cancel the polling watchdog timer. */
  const clearPollTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  /**
   * Tear down all in-progress state, except error. This allows teardown to
   * be used in all cases. In errors, set an error then call teardown().
   * An error present will automatically set status to error
   */
  const teardown = useCallback(() => {
    clearPollTimeout()
    setPhase('idle')
    setJobId(null)
    isInProgressRef.current = false
  }, [clearPollTimeout])

  /**
   * Delete a job from the backend and evict it from the query cache.
   * Error is returned as this is a utility function
   */
  const deleteJob = useCallback(
    async (id: string): Promise<string | null> => {
      try {
        await apiDELETE(`/jobs/${id}`)
        queryClient.removeQueries({ queryKey: ['jobs', id] })
        return null
      } catch (err) {
        return err instanceof ApiError ? err.message : String(err)
      }
    },
    [queryClient],
  )

  /* Clean up a failed job from the backend. */
  useEffect(() => {
    if (polledJob?.status !== 'failed') return

    const jobError = polledJob.error ?? 'Job failed with no error message.'

    async function handleFailedJob() {
      const deleteError = await deleteJob(polledJob!.job_id)

      setError(
        deleteError
          ? `Job failed: ${jobError} & deleting job also failed: ${deleteError}`
          : jobError,
      )
      teardown()
    }
    handleFailedJob()
  }, [polledJob, deleteJob, teardown])

  /* Clean up after completed job */
  useEffect(() => {
    if (polledJob?.status !== 'done') return
    clearPollTimeout()
    isInProgressRef.current = false
  }, [polledJob?.status, clearPollTimeout])

  /**
   *
   * Public methods
   *
   */

  const extract = useCallback(
    async (file: File) => {
      if (isInProgressRef.current) {
        throw new Error(
          'useCORExtraction: A job is already in progress. Call reset() before starting a new extraction.',
        )
      }

      isInProgressRef.current = true
      setError(null)
      setPhase('uploading')

      try {
        const res = await createJob(file)
        setJobId(res.job_id)
        setPhase('processing')

        /* Stop polling and clean up if the job takes too long */
        timeoutRef.current = setTimeout(async () => {
          setError('Extraction timed out. Please try again.')
          const currentJobId = res.job_id
          teardown()
          /* If deleteJob() fails, error is not set. Could be included in the message */
          await deleteJob(currentJobId)
        }, POLL_TIMEOUT_MS)
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : String(err)
        setError(msg)
        teardown()
      }
    },
    [createJob, deleteJob, teardown],
  )

  const reset = useCallback(async () => {
    const currentJobId = jobId

    /* Snap the UI back to idle immediately before awaiting the DELETE. */
    setError(null)
    teardown()

    if (currentJobId) {
      const deleteError = await deleteJob(currentJobId)
      if (deleteError) {
        setError(`reset: Failed to delete job from backend: ${deleteError}`)
      }
    }
  }, [jobId, deleteJob, teardown])

  /* Derive the public status. Status = job.status + phase */
  const status: Status = (() => {
    if (phase === 'uploading') return 'uploading'

    if (phase === 'processing') {
      if (polledJob?.status === 'done') return 'done'
      /* job.failed is handled by the effect above so wait in 'processing' */
      return 'processing'
    }

    /* Setting an error will automatically status to error */
    return error ? 'error' : 'idle'
  })()

  const isLoading = status === 'uploading' || (status === 'processing' && isPolling)
  const isError = status === 'error'

  return {
    extract,
    data: polledJob?.status === 'done' ? (polledJob.result ?? null) : null,
    job: polledJob ?? null,
    status,
    isLoading,
    isError,
    error,
    reset,
  }
}
