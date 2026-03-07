import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarPlusIcon } from 'lucide-react'

function EditSubject() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <CalendarPlusIcon /> Edit Subject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
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

export default EditSubject
