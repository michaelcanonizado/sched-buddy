'use client'

import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { HeartCrack, ScanQrCode, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import healthQueryOptions from '../query-options/health-query-options'
import { toast } from 'sonner'

export default function ScanCORLink() {
  const router = useRouter()
  const { isError, refetch, isFetching } = useQuery(
    healthQueryOptions({
      enabled: false,
      staleTime: 0,
      retry: false,
    }),
  )

  async function handleClick() {
    const { isError } = await refetch()
    if (isError) {
      toast.error('Model not available 💔', { position: 'top-center' })
      return
    }
    router.push('/scan-cor')
  }

  function getLabel() {
    if (isError) {
      return (
        <>
          <HeartCrack /> Sorry, the model is not available at the moment
        </>
      )
    }

    if (isFetching) {
      return (
        <>
          <Search /> Checking model availability...
        </>
      )
    }

    return (
      <>
        <ScanQrCode /> Scan COR
      </>
    )
  }

  return (
    <Button onClick={handleClick} disabled={isError || isFetching}>
      {getLabel()}
    </Button>
  )
}
