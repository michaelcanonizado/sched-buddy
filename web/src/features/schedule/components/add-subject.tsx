'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { CalendarPlusIcon, XIcon } from 'lucide-react'
import { Day } from '../lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import formatDay from '../lib/format-day'
import { TextBody } from '@/components/text'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import z from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const days: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const timeSchema = z.object({
  hours: z.number().min(1, 'minimum hour is 1').max(12, 'max hour is 12'),
  minutes: z.number().min(0, 'minimum minute is 0').max(59, 'max minute is 59'),
  meridiem: z.enum(['am', 'pm'], 'Choose a meridiem'),
})
type Time = z.infer<typeof timeSchema>

const addMeetingSchema = z.object({
  instructor: z.string().min(1, 'Meeting instructor is required'),
  startTime: timeSchema,
  endTime: timeSchema,
})

const addSubjectSchema = z.object({
  title: z.string().min(1, 'Subject title is required'),
  color: z.string().min(1, 'Color is required'),
  meetings: z.array(addMeetingSchema).min(1, 'Add at least one meeting.'),
})

const defaultMeeting: z.infer<typeof addMeetingSchema> = {
  instructor: '',
  startTime: { hours: 0, minutes: 0, meridiem: 'am' },
  endTime: { hours: 0, minutes: 0, meridiem: 'am' },
}

function AddSubject() {
  const { addSubject } = useScheduleActions()

  const form = useForm<z.infer<typeof addSubjectSchema>>({
    resolver: zodResolver(addSubjectSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      // Add default colors to choose from
      color: '',
      meetings: [defaultMeeting],
    },
  })

  const {
    fields: meetings,
    append: appendMeeting,
    remove: removeMeeting,
  } = useFieldArray({
    control: form.control,
    name: 'meetings',
  })

  function onSubmit(values: z.infer<typeof addSubjectSchema>) {
    console.log('Submitted: ', values)
  }

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

        <form id='add-subject' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='flex max-h-[500px] flex-col gap-4 overflow-y-scroll'>
            {/* General Subject Details */}
            <FieldSet>
              <FieldGroup>
                <Controller
                  name='title'
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation='horizontal'
                        className='flex flex-col gap-2'
                      >
                        <div className='flex w-full flex-row gap-2'>
                          <FieldLabel
                            htmlFor='add-subject_title'
                            className='whitespace-nowrap'
                          >
                            Subject Title
                          </FieldLabel>

                          <Input
                            {...field}
                            id='add-subject_title'
                            placeholder='Lorem Ipsum'
                            autoComplete='off'
                            aria-invalid={fieldState.invalid}
                          />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Controller
                  name='color'
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        data-invalid={fieldState.invalid}
                        orientation='horizontal'
                        className='flex flex-col gap-2'
                      >
                        <div className='flex w-full flex-row gap-2'>
                          <FieldLabel
                            htmlFor='add-subject_color'
                            className='whitespace-nowrap'
                          >
                            Color
                          </FieldLabel>

                          <Input
                            {...field}
                            id='add-subject_color'
                            placeholder='#f4f4f4'
                            autoComplete='off'
                            aria-invalid={fieldState.invalid}
                          />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </FieldSet>

            {/* Meeting details */}

            <div className='flex flex-col gap-2'>
              {meetings.map((field, index) => {
                return (
                  <FieldSet
                    key={field.id}
                    className='w-full overflow-hidden rounded-md border-2'
                  >
                    <div className='flex items-center justify-between bg-teal-700 px-2'>
                      <TextBody className='text-white'>
                        Meeting Time {index + 1}
                      </TextBody>
                      {meetings.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='border-none'
                          onClick={() => removeMeeting(index)}
                          aria-label={`Remove meeting ${index + 1}`}
                        >
                          <XIcon className='stroke-white' />
                        </Button>
                      )}
                    </div>
                    <FieldGroup className='m-2 w-auto overflow-hidden rounded-md border p-2'>
                      <Controller
                        name={`meetings.${index}.instructor`}
                        control={form.control}
                        render={({ field: controllerField, fieldState }) => {
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`add-subject_meetings.${index}.instructor`}
                              >
                                Instructor
                              </FieldLabel>
                              <Input
                                {...controllerField}
                                id={`add-subject_meetings.${index}.instructor`}
                                placeholder='Professor X'
                                autoComplete='off'
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <div className='flex flex-row justify-between'>
                        {days.map((day) => {
                          return (
                            <Field
                              key={`add-subject_meetings.${index}.day.${day}`}
                              orientation='vertical'
                              className='items-center [&>*]:w-min'
                            >
                              <FieldLabel
                                htmlFor={`add-subject_meetings.${index}.day.${day}`}
                                className='font-normal hover:cursor-pointer'
                                defaultChecked
                              >
                                {formatDay(day, 'title', true)}
                              </FieldLabel>
                              <Checkbox
                                id={`add-subject_meetings.${index}.day.${day}`}
                                className='size-4!'
                              />
                            </Field>
                          )
                        })}
                      </div>
                      <Controller
                        name={`meetings.${index}.startTime`}
                        control={form.control}
                        render={({ field: controllerField, fieldState }) => {
                          return (
                            <Field
                              data-invalid={fieldState.invalid}
                              className='flex flex-row gap-2'
                            >
                              <FieldLabel
                                htmlFor={`meetings.${index}.startTime`}
                                className='w-min! whitespace-nowrap'
                              >
                                Start Time
                              </FieldLabel>
                              <TimeInput
                                id={`meetings.${index}.startTime`}
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )
                        }}
                      />
                      <Controller
                        name={`meetings.${index}.endTime`}
                        control={form.control}
                        render={({ field: controllerField, fieldState }) => {
                          console.log(fieldState.invalid)
                          console.log(fieldState.error)
                          return (
                            <Field
                              data-invalid={fieldState.invalid}
                              className='flex flex-col gap-2'
                            >
                              <div className='flex flex-row gap-2'>
                                <FieldLabel
                                  htmlFor={`meetings.${index}.endTime`}
                                  className='w-min! whitespace-nowrap'
                                >
                                  End Time
                                </FieldLabel>
                                <TimeInput
                                  id={`meetings.${index}.endTime`}
                                  value={controllerField.value}
                                  onChange={controllerField.onChange}
                                />
                              </div>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error.hours]} />
                              )}
                            </Field>
                          )
                        }}
                      />
                    </FieldGroup>
                  </FieldSet>
                )
              })}
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => appendMeeting(defaultMeeting)}
              /* To limit a number of meetings */
              // disabled={meetings.length >= 5}
            >
              Add Another Meeting
            </Button>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Field orientation='horizontal'>
            <Button type='submit' form='add-subject'>
              Submit
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubject

function TimeInput({
  value,
  onChange,
  id,
  className,
}: {
  value: Time
  onChange: (value: Time) => void
  id: string
} & ComponentClassNameProp) {
  const [time, setTime] = useState<Time>(value)

  /* sync when RHF changes externally (reset, setValue, etc.) */
  useEffect(() => {
    setTime(value)
  }, [value])

  const updateHours = (value: Time['hours']) => {
    const newTime: Time = {
      ...time,
      hours: value,
    }
    setTime(newTime)
    onChange(newTime)
  }

  const updateMinutes = (value: Time['minutes']) => {
    const newTime: Time = {
      ...time,
      minutes: value,
    }
    setTime(newTime)
    onChange(newTime)
  }

  const updateMeridiem = (value: Time['meridiem']) => {
    const newTime: Time = {
      ...time,
      meridiem: value,
    }
    setTime(newTime)
    onChange(newTime)
  }

  const meridiems: Time['meridiem'][] = ['am', 'pm']

  return (
    <div className={cn('flex flex-row gap-4', className)}>
      <div className='flex flex-row items-center gap-1'>
        <Field orientation='horizontal'>
          <Input
            id={id}
            type='number'
            placeholder='12'
            className='w-[75px]!'
            value={time.hours}
            onChange={(e) => updateHours(Number(e.target.value))}
          />
        </Field>
        <TextBody>:</TextBody>
        <Field>
          <Input
            type='number'
            placeholder='00'
            className='w-[75px]!'
            value={time.minutes}
            onChange={(e) => updateMinutes(Number(e.target.value))}
          />
        </Field>
      </div>
      <RadioGroup
        defaultValue='am'
        className='text-foreground! flex flex-row gap-0 divide-y rounded-md border'
        onValueChange={(value) => updateMeridiem(value as Time['meridiem'])}
      >
        {meridiems.map((meridiem, index) => {
          return (
            <FieldLabel
              key={index}
              htmlFor={`${id}.${meridiem}`}
              className='rounded-none! border-none hover:cursor-pointer'
            >
              <Field orientation='horizontal' className='py-2!'>
                <FieldContent>
                  <FieldTitle>{meridiem.toUpperCase()}</FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value={meridiem}
                  id={`${id}.${meridiem}`}
                  className='hidden'
                />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>
    </div>
  )
}

// {/* Meetings */}
//           <FieldSet>
//             <FieldLegend>Meeting Time 1</FieldLegend>
//             <FieldDescription></FieldDescription>
//             {/* Meeting Time */}
//             <FieldGroup>
//               <Field>
//                 <FieldLabel></FieldLabel>
//                 <Input />
//                 <FieldDescription></FieldDescription>
//               </Field>
//             </FieldGroup>

//             {/* Meeting Information */}
//             <FieldGroup>
//               {/* Days */}
//               <FieldGroup className='flex flex-row'>
//                 {days.map((day) => {
//                   return (
//                     <Field key={day} orientation='horizontal'>
//                       <Checkbox id={day} />
//                       <FieldLabel
//                         htmlFor={day}
//                         className='font-normal'
//                         defaultChecked
//                       >
//                         {formatDay(day, 'title', true)}
//                       </FieldLabel>
//                     </Field>
//                   )
//                 })}
//               </FieldGroup>

//               <FieldGroup className='grid grid-rows-2 gap-4'>
//                 <div className='flex w-min flex-row gap-4'>
//                   <div className='flex flex-row items-center gap-1'>
//
//                 </div>
//               </FieldGroup>
//             </FieldGroup>
//           </FieldSet>
