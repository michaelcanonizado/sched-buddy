import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { CalendarPlusIcon } from 'lucide-react'
import { Day } from '../lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import formatDay from '../lib/format-day'
import { TextBody } from '@/components/text'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const days: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

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
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Subject title */}
        <FieldSet>
          <FieldLegend></FieldLegend>
          <FieldDescription></FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel>Subject Title</FieldLabel>
              <Input />
              <FieldDescription></FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Meetings */}
        <FieldSet>
          <FieldLegend>Meeting Time 1</FieldLegend>
          <FieldDescription></FieldDescription>
          {/* Meeting Time */}
          <FieldGroup>
            <Field>
              <FieldLabel></FieldLabel>
              <Input />
              <FieldDescription></FieldDescription>
            </Field>
          </FieldGroup>

          {/* Meeting Information */}
          <FieldGroup>
            {/* Days */}
            <FieldGroup className='flex flex-row'>
              {days.map((day) => {
                return (
                  <Field key={day} orientation='horizontal'>
                    <Checkbox id={day} />
                    <FieldLabel
                      htmlFor={day}
                      className='font-normal'
                      defaultChecked
                    >
                      {formatDay(day, 'title', true)}
                    </FieldLabel>
                  </Field>
                )
              })}
            </FieldGroup>

            <FieldGroup className='grid grid-rows-2 gap-4'>
              <div className='flex w-min flex-row gap-4'>
                <div className='flex flex-row items-center gap-1'>
                  <Field orientation='horizontal'>
                    <FieldLabel
                      htmlFor='startTimeHours'
                      className='whitespace-nowrap'
                    >
                      Start Time
                    </FieldLabel>
                    <Input
                      id='startTimeHours'
                      type='number'
                      placeholder='12'
                      className='w-[75px]!'
                    />
                  </Field>
                  <TextBody>:</TextBody>
                  <Field>
                    <Input
                      id='startTimeMinutes'
                      type='number'
                      placeholder='00'
                      className='w-[75px]!'
                    />
                  </Field>
                </div>
                <RadioGroup
                  defaultValue='am'
                  className='flex flex-row gap-0 divide-y rounded-md border'
                >
                  <FieldLabel
                    htmlFor='am'
                    className='rounded-none! border-none hover:cursor-pointer'
                  >
                    <Field orientation='horizontal' className='py-2!'>
                      <FieldContent>
                        <FieldTitle>AM</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value='am' id='am' className='hidden' />
                    </Field>
                  </FieldLabel>
                  <FieldLabel
                    htmlFor='pm'
                    className='rounded-none! border-none hover:cursor-pointer'
                  >
                    <Field orientation='horizontal' className='py-2!'>
                      <FieldContent>
                        <FieldTitle>PM</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value='pm' id='pm' className='hidden' />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </div>
            </FieldGroup>
          </FieldGroup>
        </FieldSet>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubject
