import type { UseQueryOptions } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { HealthResponse, healthResponseSchema, Job, jobSchema } from '../schemas'
import { ApiError, apiGET } from '../lib/api'

export default function healthQueryOptions<TData = HealthResponse, TError = string>(
  options?: Omit<UseQueryOptions<HealthResponse, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    staleTime: 1000 * 60 * 10,
    ...options,
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiGET(`/health`)
      const parsedResponse = healthResponseSchema.safeParse(await response.json())
      if (!parsedResponse.success) {
        throw new ApiError(response.status, `/health response doesn't match schema!`)
      }
      return parsedResponse.data
    },
  })
}
