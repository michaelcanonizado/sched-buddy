'use client'

import WidthContainer from '@/components/container'
import { Button } from '@/components/ui/button'
import AddSubject from '@/features/schedule/components/actions/add-subject'
import ChangeDisplay from '@/features/schedule/components/actions/change-display'
import DeleteSubject from '@/features/schedule/components/actions/delete-subject'
import EditSubject from '@/features/schedule/components/actions/edit-subject'
import ScheduleView from '@/features/schedule/components/schedule-view'
import { PlusIcon } from 'lucide-react'
import { TextBody } from '@/components/text'
import ChangeBackground from '@/features/schedule/components/actions/change-background'
import { ComponentChildrenProp } from '@/types'
import ExportSchedule from '@/features/schedule/components/actions/export-schedule'

function ButtonGroup({ children }: ComponentChildrenProp) {
  return <div className='flex flex-col gap-2'>{children}</div>
}

function Sidebar() {
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
          <ExportSchedule />
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
