'use client'

import { Button } from '@/components/ui/button'
import { ScanQrCode } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { validateCORFileType as validateCORFile } from '../lib/validate-cor-file-type'
import { toast } from 'sonner'
import { TextBody, TextHeadingSM, TextSub } from '@/components/text'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useCORExtraction } from '../hooks/use-cor-extraction'
import { Job } from '../schemas'

function LoadingScreen({
  show,
  startTime,
  job,
}: {
  show: boolean
  startTime: number | null
  job: Job | null
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!show || !startTime) return

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [show, startTime])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  function getLoadingLabel(jobStatus?: Job['status']) {
    switch (jobStatus) {
      case 'pending':
        return 'Starting extraction...'
      case 'processing':
        return 'Extracting text...'
      case 'done':
        return 'Extracting complete...'
      case 'failed':
        return 'Extraction failed...'
      default:
        return 'No job was passed'
    }
  }

  if (!job) return

  return (
    <div
      className={cn(
        'bg-background fixed inset-0 z-[999999] flex flex-row items-center justify-center transition-all duration-200',
        show ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className='flex flex-col items-center justify-center *:text-center'>
        <TextHeadingSM>Loading...</TextHeadingSM>
        <TextBody>{getLoadingLabel(job.status)}</TextBody>
        {startTime && <TextSub>Elapsed Time: {formatTime(elapsed)}</TextSub>}
      </div>
    </div>
  )
}

export default function ScanButton() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const { extract, status, data, isLoading, isError, error, job } = useCORExtraction()

  function onButtonClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    /* Reset input so the same file can be re-selected if needed */
    e.target.value = ''

    /* Client side validation for file */
    try {
      validateCORFile(file)
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, { position: 'top-center' })
      } else {
        toast.error('Sorry an error occurred')
      }
      return
    }

    try {
      setStartTime(Date.now())

      extract(file)

      /* Update zustand */

      /* Redirect to scheudle */
      // router.push('/schedule')
      return
    } catch {
      if (!isError) {
        toast.error(error, { position: 'top-center' })
      } else {
        toast.error("Sorry can't process file!", { position: 'top-center' })
      }
      return
    }
  }

  /* Prevent scrolling when loading screen is shown. If weird scroll is still present behavior (especially on mobile), add: overscroll-none */
  useEffect(() => {
    if (status === 'uploading') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [status])

  return (
    <div className='size-fit'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.png,.jpg,.jpeg,.pdf'
        className='hidden'
        onChange={handleFileChange}
      />
      <Button onClick={onButtonClick} disabled={status === 'uploading' || status === 'processing'}>
        <ScanQrCode /> Scan COR
      </Button>
      <LoadingScreen
        show={status === 'uploading' || status === 'processing'}
        startTime={startTime}
        job={job}
      />
    </div>
  )
}
