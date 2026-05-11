import type { UseQueryOptions } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { Jobs, jobsSchema } from '../schemas'
import { ApiError, apiGET } from '../lib/api'

export default function jobsQueryOptions<TData = Jobs, TError = string>(
  options?: Omit<UseQueryOptions<Jobs, TError, TData>, 'queryKey' | 'queryFn'>,
) {
  return queryOptions({
    staleTime: 1000 * 60 * 10,
    ...options,
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await apiGET(`/jobs/`)
      const parsedResponse = jobsSchema.safeParse(await response.json())
      if (!parsedResponse.success) {
        throw new ApiError(response.status, `/jobs response doesn't match schema!`)
      }
      return parsedResponse.data
    },
  })
}
