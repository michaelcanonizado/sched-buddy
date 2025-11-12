import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import Schedule from '@/features/schedule/components/schedule'
import {
  CalendarPlusIcon,
  FolderUpIcon,
  ImageDownIcon,
  MonitorSmartphoneIcon,
  PencilIcon,
  PlusIcon,
  ScanQrCodeIcon,
  Trash2Icon,
} from 'lucide-react'

export default function SchedulePage() {
  return (
    <Container className='mt-16 max-w-[1440px]'>
      <div className='flex flex-row gap-4'>
        <div className='flex flex-col gap-4'>
          <Button variant='outline'>
            <ScanQrCodeIcon /> Scan COR
          </Button>
          <Button variant='outline'>
            <MonitorSmartphoneIcon />
            Pick a Display
          </Button>
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
        <Schedule className='grow bg-orange-500' />
      </div>
    </Container>
  )
}
