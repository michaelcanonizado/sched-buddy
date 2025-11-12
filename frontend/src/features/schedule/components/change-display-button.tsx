import { Button } from '@/components/ui/button'
import { MonitorSmartphoneIcon } from 'lucide-react'
import displays from '@/features/display/lib/displays'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TextBody } from '@/components/text'

export default function ChangeDisplayButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <MonitorSmartphoneIcon />
          Change Display
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Display</DialogTitle>
          <DialogDescription>
            This sets the dimensions for the schedule export
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <TextBody className='text-center'>Temporary content</TextBody>
          <div className='flex flex-col gap-2'>
            {displays.map((display, index) => {
              return (
                <Button key={index} variant='outline'>
                  {display.name}
                </Button>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
