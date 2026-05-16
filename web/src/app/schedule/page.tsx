'use client'

import WidthContainer from '@/components/container'
import { Button } from '@/components/ui/button'
import AddSubject from '@/features/schedule/components/actions/add-subject'
import ChangeDisplay from '@/features/schedule/components/actions/change-display'
import DeleteSubject from '@/features/schedule/components/actions/delete-subject'
import EditSubject from '@/features/schedule/components/actions/edit-subject'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import ScheduleView from '@/features/schedule/components/schedule-view'
import { ImageDownIcon, PlusIcon } from 'lucide-react'
import { TextBody } from '@/components/text'
import ChangeBackground from '@/features/schedule/components/actions/change-background'
import { ComponentChildrenProp } from '@/types'

function ButtonGroup({ children }: ComponentChildrenProp) {
  return <div className='flex flex-col gap-2'>{children}</div>
}

function Sidebar() {
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
    <div className='bg-background flex h-fit flex-col gap-8 rounded-xl border-2 p-8'>
      <ButtonGroup>
        <TextBody>Timetable</TextBody>
        <div className='flex flex-col gap-2'>
          <AddSubject />
          <EditSubject />
          <DeleteSubject />
        </div>
      </ButtonGroup>
      <ButtonGroup>
        <TextBody>Customize</TextBody>
        <div className='flex flex-col gap-2'>
          <ChangeBackground />
          <ChangeDisplay />
        </div>
      </ButtonGroup>
      <ButtonGroup>
        <TextBody>File</TextBody>
        <div className='flex flex-col gap-2'>
          <Button variant='outline' onClick={onExport}>
            <ImageDownIcon />
            Save as Image
          </Button>
          <Button variant='outline'>
            <PlusIcon />
            New Schedule
          </Button>
        </div>
      </ButtonGroup>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <div className='bg-muted flex grow'>
      <WidthContainer className='mt-16 mb-8 flex grow flex-row'>
        <div className='flex grow flex-col gap-4 md:flex-row'>
          <Sidebar />

          <div className='relative h-full min-h-[600px] grow rounded-xl border-2'>
            <ScheduleView />
          </div>
        </div>
      </WidthContainer>
    </div>
  )
}
