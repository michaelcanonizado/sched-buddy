import { TextBody, TextSub } from '@/components/text'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useScheduleStore } from '../store/use-schedule-store'
import { cn } from '@/lib/utils'
import { Subject } from '../types'
import { denormalizeTime } from '../lib/denormalizeTime'

export default function SelectSubjectDialogContent({
  onSelect,
  headerLabel = 'Select a Subject',
}: {
  onSelect: (subject: Subject) => void
  headerLabel?: string
}) {
  const subjects = useScheduleStore((s) => s.subjects)

  return (
    <DialogContent className='overflow-hidden'>
      <DialogHeader>
        <DialogTitle>{headerLabel}</DialogTitle>
      </DialogHeader>

      <div className='bg-muted max-h-[500px] overflow-y-scroll p-8'>
        <div className='flex flex-col gap-3'>
          {subjects.map((subject) => {
            return (
              <div
                key={subject.id}
                onClick={() => onSelect(subject)}
                className={cn(
                  'flex grow flex-col justify-center rounded-xl px-4 py-6 hover:cursor-pointer',
                  `border-l-[12px] border-l-[${subject.color}]`,
                  'transition duration-300 hover:brightness-95',
                )}
                style={{ borderLeftColor: subject.color, backgroundColor: `${subject.color}75` }}
              >
                <TextBody className='mb-0 font-bold'>{subject.title}</TextBody>
                <div className='flex flex-col pl-0'>
                  {subject.meetings.map((meeting) => {
                    const startTime = denormalizeTime(meeting.startTime)
                    const endTime = denormalizeTime(meeting.endTime)
                    return (
                      <div
                        key={`${subject}.${meeting.id}`}
                        className='mb-[-4px] flex flex-row items-end'
                      >
                        <TextSub className='mr-[3px]'>-</TextSub>
                        {meeting.days.map((day, dayIndex) => (
                          <>
                            <TextSub key={`${subject}.${meeting.id}.${day}.${dayIndex}`}>
                              {day
                                .trim()
                                .toLowerCase()
                                .split(/\s+/)
                                .map((word) => word[0].toUpperCase() + word.slice(1))
                                .join(' ')}
                            </TextSub>
                            {dayIndex !== meeting.days.length - 1 && (
                              <TextSub className='mr-[2px]'>,</TextSub>
                            )}
                          </>
                        ))}
                        <TextSub className='ml-[3px]'>@</TextSub>
                        <TextSub>
                          {startTime.hours}:{startTime.minutes?.toString().padStart(2, '0')}
                          {startTime.meridiem}
                        </TextSub>
                        {' - '}
                        <TextSub>
                          {endTime.hours}:{endTime.minutes?.toString().padStart(2, '0')}
                          {endTime.meridiem}
                        </TextSub>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DialogContent>
  )
}
