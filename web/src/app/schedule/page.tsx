'use client'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'
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

  return (
    <Container className='mt-16 mb-8 flex max-w-[1440px] grow'>
      <div className='flex grow flex-row gap-4'>
        <div className='flex flex-col gap-4'>
          <Button variant='outline'>
            <ScanQrCodeIcon /> Scan COR
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              console.log('btn click')
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
          <Button variant='outline'>
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

        <div className='relative h-full grow rounded-xl border-2'>
          <ScheduleView />
        </div>
      </div>
    </Container>
  )
}
