'use client'

import { Button } from '@/components/ui/button'
import { MonitorSmartphoneIcon } from 'lucide-react'
import displays from '@/features/display/lib/displays'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TextBody } from '@/components/text'
import { useDisplayActions } from '@/features/display/store/use-display-store'

export default function ChangeDisplayButton() {
  const { setDisplay, setOrientation } = useDisplayActions()

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
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant='outline'
              onClick={() => setOrientation('portrait')}
            >
              Portrait
            </Button>
            <Button
              variant='outline'
              onClick={() => setOrientation('landscape')}
            >
              Landscape
            </Button>
          </div>
          <div className='flex flex-col gap-2'>
            {displays.map((display, index) => {
              return (
                <DialogClose key={index} asChild>
                  <Button variant='outline' onClick={() => setDisplay(display)}>
                    {display.name}
                  </Button>
                </DialogClose>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
