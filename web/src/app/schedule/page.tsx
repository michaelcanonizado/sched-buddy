'use client'

import WidthContainer from '@/components/container'
import { Button } from '@/components/ui/button'
import AddSubject from '@/features/schedule/components/actions/add-subject'
import ChangeDisplay from '@/features/schedule/components/actions/change-display'
import DeleteSubject from '@/features/schedule/components/actions/delete-subject'
import EditSubject from '@/features/schedule/components/actions/edit-subject'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import ScheduleView from '@/features/schedule/components/schedule-view'
import {
  FolderUpIcon,
  ImageDownIcon,
  PlusIcon,
  ScanQrCodeIcon,
  WandSparklesIcon,
} from 'lucide-react'
import AddBackgroundImage from '@/features/schedule/components/actions/add-background-image'
import { TextBody } from '@/components/text'
import AddBackgroundFill from '@/features/schedule/components/actions/add-background-fill'

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
    <WidthContainer className='mt-16 mb-8 flex grow md:max-w-[1440px]'>
      <div className='flex grow flex-col gap-4 md:flex-row'>
        <div className='flex flex-col gap-4'>
          <AddSubject />
          <EditSubject />
          <DeleteSubject />
          <div className='flex w-full flex-col items-center rounded-lg border-2'>
            <div className='flex w-full flex-row items-center justify-center gap-2 border-b-2 py-4'>
              <WandSparklesIcon />
              <TextBody>Customize</TextBody>
            </div>
            <div className='flex w-full flex-col gap-2 px-4 pb-4'>
              <TextBody className='mt-4'>Background</TextBody>
              <AddBackgroundImage />
              <AddBackgroundFill />
              <TextBody className='mt-4'>Timetable</TextBody>
              <ChangeDisplay />
              <Button variant='outline'>To-implement</Button>
            </div>
          </div>
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
    </WidthContainer>
  )
}
