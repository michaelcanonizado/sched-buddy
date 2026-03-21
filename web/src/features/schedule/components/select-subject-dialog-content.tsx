import { TextBody } from '@/components/text'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useScheduleStore } from '../store/use-schedule-store'
import { cn } from '@/lib/utils'
import { Subject } from '../types'

export default function SelectSubjectDialogContent({
  onSelect,
}: {
  onSelect: (subject: Subject) => void
}) {
  const subjects = useScheduleStore((s) => s.subjects)

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select a Subject</DialogTitle>
      </DialogHeader>

      <div className='max-h-[500px] overflow-y-scroll'>
        <div className='flex flex-col gap-4'>
          {subjects.map((subject) => {
            return (
              <div
                onClick={() => onSelect(subject)}
                className={cn(
                  'flex grow flex-col items-center justify-center rounded-md px-4 py-6 hover:cursor-pointer',
                  'border-2 border-transparent transition-colors duration-300 hover:border-black',
                )}
                style={{ backgroundColor: subject.color }}
                key={subject.id}
              >
                <TextBody className='text-center'>{subject.title}</TextBody>
              </div>
            )
          })}
        </div>
      </div>
    </DialogContent>
  )
}
