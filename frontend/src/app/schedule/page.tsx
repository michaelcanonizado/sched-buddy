'use client'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import ChangeDisplayButton from '@/features/schedule/components/change-display-button'
import ScheduleView from '@/features/schedule/components/schedule-view'
import {
  useScheduleActions,
  useTimetableStyles,
} from '@/features/schedule/store/use-schedule-store'
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
  const timetableStyles = useTimetableStyles()
  const { setTimetableStylesMargins } = useScheduleActions()

  return (
    <Container className='mt-16 mb-8 flex max-w-[1440px] grow'>
      <div className='flex grow flex-row gap-4'>
        <div className='flex flex-col gap-4'>
          <Button variant='outline'>
            <ScanQrCodeIcon /> Scan COR
          </Button>
          <ChangeDisplayButton />
          <Button variant='outline'>
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
          <div className='absolute top-4 left-4 flex flex-col gap-2'>
            <div className='flex flex-row gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setTimetableStylesMargins({
                    x: timetableStyles.margins.x + 1,
                  })
                }}
              >
                Margin X +
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setTimetableStylesMargins({
                    x: timetableStyles.margins.x - 1,
                  })
                }}
              >
                Margin X -
              </Button>
            </div>
            <div className='flex flex-row gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setTimetableStylesMargins({
                    y: timetableStyles.margins.y + 1,
                  })
                }}
              >
                Margin Y +
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setTimetableStylesMargins({
                    y: timetableStyles.margins.y - 1,
                  })
                }}
              >
                Margin Y -
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
