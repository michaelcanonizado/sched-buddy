'use client'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import ChangeDisplayDialog from '@/features/display/components/change-display-dialog'
import ScheduleView from '@/features/schedule/components/schedule-view'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import {
  CalendarPlusIcon,
  FolderUpIcon,
  ImageDownIcon,
  PencilIcon,
  PlusIcon,
  ScanQrCodeIcon,
  Trash2Icon,
} from 'lucide-react'

export default function SchedulePage() {
  const { addSubject } = useScheduleActions()
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
          <ChangeDisplayDialog />
          <Button
            variant='outline'
            onClick={() => {
              addSubject()
            }}
          >
            <CalendarPlusIcon /> Add Course
          </Button>
          <Button variant='outline'>
            <PencilIcon />
            Edit Course
          </Button>
          <Button variant='outline'>
            <Trash2Icon />
            Delete Course
          </Button>
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
