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
import displays from '@/features/display/lib/displays'
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

        <div className='flex flex-col gap-2'>
          <Button variant='outline' onClick={() => setDisplay(null)}>
            No display
          </Button>
          {displays.map((display, index) => {
            return (
              <Button
                key={index}
                variant='outline'
                onClick={() => setDisplay(display)}
              >
                {display.name}
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
