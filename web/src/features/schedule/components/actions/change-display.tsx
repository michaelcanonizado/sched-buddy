import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TabletSmartphone } from 'lucide-react'
import displays from '@/features/schedule/lib/displays'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'

export default function ChangeDisplay() {
  const { setDisplay } = useScheduleActions()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <TabletSmartphone />
          Change Display
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Display</DialogTitle>
          <DialogDescription>Change the background device</DialogDescription>
        </DialogHeader>

        <div className='max-h-[500px] overflow-y-scroll'>
          <div className='flex flex-col gap-4 p-8'>
            {displays.map((display, index) => {
              return (
                <Button key={index} variant='outline' onClick={() => setDisplay(display)}>
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
