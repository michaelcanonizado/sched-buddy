'use client'

import WidthContainer from '@/components/container'
import AddSubject from '@/features/schedule/components/actions/add-subject'
import WallpaperSetup from '@/features/schedule/components/actions/wallpaper-setup'
import DeleteSubject from '@/features/schedule/components/actions/delete-subject'
import EditSubject from '@/features/schedule/components/actions/edit-subject'
import ScheduleView from '@/features/schedule/components/schedule-view'
import { TextBody } from '@/components/text'
import ChangeBackground from '@/features/schedule/components/actions/change-background'
import { ComponentChildrenProp } from '@/types'
import ExportSchedule from '@/features/schedule/components/actions/export-schedule'
import { useScheduleActions, useScheduleStore } from '@/features/schedule/store/use-schedule-store'
import { cn } from '@/lib/utils'
import NewSchedule from '@/features/schedule/components/actions/new-schedule'

function ButtonGroup({ children }: ComponentChildrenProp) {
  return <div className='flex flex-col gap-2'>{children}</div>
}

function Sidebar() {
  const { title } = useScheduleStore()
  const { setTitle } = useScheduleActions()

  return (
    <div
      className={'bg-background flex h-fit max-w-[300px] flex-col overflow-hidden rounded-2xl'}
      style={{ boxShadow: 'rgba(16,16,16,0.08) 0px 0px 6px 0px' }}
    >
      <div className='bg-brand-yellow/60 w-full px-8 pt-5 pb-5'>
        <input
          className={cn(
            'focus-visible:outline-none',
            'border-brand-yellow border-b-[3px]',
            'font-heading text-foreground-100 text-[20px] leading-[120%] font-[500] tracking-[-0.5%]',
            'm-0 !w-full p-0',
          )}
          placeholder='Schedule Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className='flex h-fit flex-col gap-8 p-6'>
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
            <WallpaperSetup />
            <ChangeBackground />
          </div>
        </ButtonGroup>
        <ButtonGroup>
          <TextBody>File</TextBody>
          <div className='flex flex-col gap-2'>
            <ExportSchedule />
            <NewSchedule />
          </div>
        </ButtonGroup>
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <div className='bg-muted flex grow'>
      <WidthContainer className='mt-16 mb-8 flex grow flex-row'>
        <div className='flex grow flex-col gap-4 md:flex-row'>
          <Sidebar />

          <div
            className='bg-background relative h-full min-h-[600px] grow rounded-xl'
            style={{ boxShadow: 'rgba(16,16,16,0.08) 0px 0px 6px 0px' }}
          >
            <ScheduleView />
          </div>
        </div>
      </WidthContainer>
    </div>
  )
}
