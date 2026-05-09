'use client'

import { Button } from '@/components/ui/button'
import { ScanQrCode } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { validateCORFileType as validateCORFile } from '../lib/validate-cor-file-type'
import { uploadCOR } from '../actions/upload-cor'
import { toast } from 'sonner'
import { TextHeadingSM } from '@/components/text'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Status = 'idle' | 'uploading' | 'error'
function LoadingScreen({ show }: { show: boolean }) {
  return (
    <div
      className={cn(
        'bg-background fixed inset-0 z-[999999] flex flex-row items-center justify-center transition-all duration-200',
        show ? 'visible opacity-100' : 'invisible opacity-0',
      )}
    >
      <div className=''>
        <TextHeadingSM>Loading...</TextHeadingSM>
      </div>
    </div>
  )
}

export default function ScanButton() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  function onButtonClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    /* Reset input so the same file can be re-selected if needed */
    e.target.value = ''

    try {
      validateCORFile(file)
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message, { position: 'top-center' })
      } else {
        toast.error('Sorry an error occurred')
      }
      setStatus('idle')
      return
    }

    /* Show loading screen */
    setStatus('uploading')

    try {
      const result = await uploadCOR(file)
      console.log('Success: ', result)

      /* Update zustand */

      /* Redirect to scheudle */
      router.push('/schedule')
      return
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Sorry can't process file!", { position: 'top-center' })
      } else {
        toast.error('Sorry an error occurred')
      }
      setStatus('idle')
      return
    }
  }

  useEffect(() => {
    /* Prevent scrolling when loading screen is shown */
    /* If you still notice weird scroll behavior (especially on mobile), add: overscroll-none */
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
      <Button onClick={onButtonClick} disabled={status === 'uploading'}>
        <ScanQrCode /> Scan COR
      </Button>
      <LoadingScreen show={status === 'uploading'} />
    </div>
  )
}
