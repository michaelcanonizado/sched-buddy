'use client'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import AddSubject from '@/features/actions/components/add-subject'
import ChangeDisplay from '@/features/actions/components/change-display'
import DeleteSubject from '@/features/actions/components/delete-subject'
import EditSubject from '@/features/actions/components/edit-subject'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import ScheduleView from '@/features/schedule/components/schedule-view'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import {
  FolderUpIcon,
  ImageDownIcon,
  PencilIcon,
  PlusIcon,
  ScanQrCodeIcon,
  Trash2Icon,
} from 'lucide-react'

export default function SchedulePage() {
  const canvasEngine = useCanvasEngine()

  const onExport = () => {
    if (!canvasEngine) {
      console.warn('Trying to export but no CanvasEngine in store')
      return
    }

    const dataUrl = canvasEngine.export()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'schedule.png'
    link.click()
  }

  return (
    <Container className='mt-16 mb-8 flex grow md:max-w-[1440px]'>
      <div className='flex grow flex-col gap-4 md:flex-row'>
        <div className='flex flex-col gap-4'>
          <Button variant='outline'>
            <ScanQrCodeIcon /> Scan COR
          </Button>
          <ChangeDisplay />
          <AddSubject />
          <EditSubject />
          <DeleteSubject />
          <Button variant='outline' onClick={onExport}>
            <ImageDownIcon />
            Export
          </Button>
          <Button variant='outline'>
            <FolderUpIcon />
            Import
          </Button>
          <Button variant='outline'>
            <PlusIcon />
            New Schedule
          </Button>
        </div>

        <div className='relative h-full min-h-[600px] grow rounded-xl border-2'>
          <ScheduleView />
        </div>
      </div>
    </Container>
  )
}
