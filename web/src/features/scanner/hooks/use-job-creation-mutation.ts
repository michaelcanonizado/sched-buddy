import { useMutation } from '@tanstack/react-query'
import { apiPOST } from '../lib/api'
import { SubmitResponse } from '../schemas'

export function useJobCreationMutation() {
  return useMutation<SubmitResponse, string, File>({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const res = await apiPOST('/extract', form)
      return await res.json()
    },
    onError: (error) => {
      console.error('Scan COR job creation failed', error)
    },
  })
}
