import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { useScheduleActions } from '../../store/use-schedule-store'
import { Subject } from '../../types'
import SelectSubjectDialogContent from '../select-subject-dialog-content'

function DeleteSubject() {
  const [open, setOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<null | Subject>(null)
  const { deleteSubject } = useScheduleActions()

  function onSubmit() {
    if (!selectedSubject) return null
    deleteSubject(selectedSubject)
    setSelectedSubject(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <PencilIcon /> Delete Subject
        </Button>
      </DialogTrigger>

      {!selectedSubject ? (
        <SelectSubjectDialogContent
          onSelect={(s) => setSelectedSubject(s)}
          headerLabel='Select a Subject to Delete'
        />
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subject Deletion</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default DeleteSubject
