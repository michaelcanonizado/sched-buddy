import type { UseQueryOptions } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { Job, jobSchema } from '../schemas'
import { ApiError, apiGET } from '../lib/api'

export default function jobQueryOptions<TData = Job, TError = string>(
  id: string | undefined | null,
  options?: Omit<UseQueryOptions<Job, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    staleTime: 1000 * 60 * 10,
    enabled: !!id,
    ...options,
    queryKey: ['jobs', id],
    queryFn: async () => {
      const response = await apiGET(`/jobs/${id}`)
      const parsedResponse = jobSchema.safeParse(await response.json())
      if (!parsedResponse.success) {
        throw new ApiError(response.status, `/jobs/${id} response doesn't match schema!`)
      }
      return parsedResponse.data
    },
  })
}
