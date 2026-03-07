import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { CalendarPlusIcon } from 'lucide-react'

function AddSubject() {
  const { addSubject } = useScheduleActions()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <CalendarPlusIcon /> Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi elit
            odio, lacinia in mollis ac, condimentum quis ligula. Ut nisi erat,
            condimentum eu pretium at
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubject
