import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useScheduleActions } from '../../store/use-schedule-store'
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

export default function NewSchedule() {
  const { resetScheduleStore } = useScheduleActions()

  function handleClick() {
    resetScheduleStore()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <PlusIcon />
          New Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to reset the schedule?</DialogTitle>
          <DialogDescription>This action cannot be reverted</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleClick}>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
