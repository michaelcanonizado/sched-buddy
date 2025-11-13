import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import ChangeDisplayButton from '@/features/schedule/components/change-display-button'
import Schedule from '@/features/schedule/components/schedule'
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
        <div className='grid grow place-items-center'>
          <Schedule className='bg-orange-500' />
        </div>
      </div>
    </Container>
  )
}
