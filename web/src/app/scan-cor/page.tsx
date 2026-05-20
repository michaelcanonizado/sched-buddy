'use client'

import { Button } from '@/components/ui/button'
import { ScanQrCode, Wand } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import WidthContainer from '@/components/container'
import { TextBody, TextDisplay, TextHeadingSM, TextSub } from '@/components/text'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'
import { useCORExtraction } from '@/features/scanner/hooks/use-cor-extraction'
import { validateCORFile } from '@/features/scanner/lib/validate-cor-file'
import { Job } from '@/features/scanner/schemas'
import Loading from '@/components/loading'
import { useQuery } from '@tanstack/react-query'
import healthQueryOptions from '@/features/scanner/query-options/health-query-options'

function IdleState({
  className,
  onUploadCORClick,
}: { onUploadCORClick: () => void } & ComponentClassNameProp) {
  return (
    <div className={cn('grid place-items-center', className)}>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-2 *:text-center'>
          <TextDisplay>Convert COR to Wallpaper</TextDisplay>
          <TextHeadingSM>Make your COR easy to read and chuchu</TextHeadingSM>
        </div>
        <div className='flex flex-col items-center gap-4'>
          <Button onClick={onUploadCORClick} className='bg-brand-yellow text-foreground-100'>
            <ScanQrCode />
            Upload COR
          </Button>
          {/* <TextSub>Or drop the file here</TextSub> */}
        </div>
      </div>
    </div>
  )
}

function LoadingScreen({
  startTime,
  job,
  className,
}: {
  startTime: number | null
  job: Job | null
} & ComponentClassNameProp) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

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
        return 'Extracting text from COR...'
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
    <div className={cn('grid place-items-center', className)}>
      <div className='flex flex-col items-center justify-center *:text-center'>
        <TextDisplay>{getLoadingLabel(job.status)}</TextDisplay>
        <div className='mt-8 mb-2'>
          <Loading height={64} />
        </div>
        {startTime && (
          <div className='flex flex-row gap-1'>
            <TextBody>Elapsed Time: </TextBody>
            <TextBody className='font-bold'>{formatTime(elapsed)}</TextBody>
          </div>
        )}
        <TextSub className=''>
          Do not close your browser. Wait until files are processed! This might take some time.
        </TextSub>
      </div>
    </div>
  )
}

function ResultsScreen({
  job,
  className,
  onConfirm,
}: {
  job: Job | null
  onConfirm: () => void
} & ComponentClassNameProp) {
  return (
    <div className={cn('grid place-items-center', className)}>
      <div className='flex flex-col items-center justify-center gap-6'>
        <div className='flex flex-col items-center *:text-center'>
          <TextDisplay>Extraction Complete!</TextDisplay>
          {job && job.result && (
            <TextHeadingSM className='mt-4'>
              Extracted {job.result.data.length} subjects!
            </TextHeadingSM>
          )}
          <div className='flex flex-row gap-1'>
            <TextBody>Elapsed Time: </TextBody>
            <TextBody className='font-bold'>0:32</TextBody>
          </div>
        </div>

        <Button onClick={onConfirm} className='bg-brand-yellow text-foreground-100'>
          <Wand />
          Start Customizing Schedule!
        </Button>
      </div>
    </div>
  )
}

export default function ScanCOR() {
  const router = useRouter()
  const { saveCORData } = useScheduleActions()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [moveToScheduleEditor, setMoveToScheduleEditor] = useState<boolean>(false)
  const { extract, status, data: extractedData, isError, error, job } = useCORExtraction()

  const { data: healthData } = useQuery(healthQueryOptions())

  useEffect(() => {
    if (healthData) return
    router.push('/')
  }, [healthData, router])

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
    } catch {
      if (!isError) {
        toast.error(error, { position: 'top-center' })
      } else {
        toast.error("Sorry can't process file!", { position: 'top-center' })
      }
      return
    }
  }

  /* Tasks to perform after data eextraction */
  useEffect(() => {
    if (!extractedData || !moveToScheduleEditor) return

    saveCORData(extractedData)
    router.push('/schedule')
  }, [extractedData, moveToScheduleEditor])

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
    <WidthContainer className='relative grow'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.png,.jpg,.jpeg,.pdf'
        className='hidden'
        onChange={handleFileChange}
      />
      {status === 'idle' && !extractedData && (
        <IdleState className='absolute inset-0' onUploadCORClick={onButtonClick} />
      )}
      {status !== 'idle' && !extractedData && (
        <LoadingScreen className='absolute inset-0' job={job} startTime={startTime} />
      )}
      {extractedData && (
        <ResultsScreen
          className='absolute inset-0'
          job={job}
          onConfirm={() => setMoveToScheduleEditor(true)}
        />
      )}
    </WidthContainer>
  )
}
