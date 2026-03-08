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

const days: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const addMeetingSchema = z.object({
  instructor: z.string().min(1, 'Meeting instructor is required'),
})

const addSubjectSchema = z.object({
  title: z.string().min(1, 'Subject title must be at least 1 character'),
  meetings: z.array(addMeetingSchema).min(1, 'Add at least one meeting.'),
})

const defaultMeeting: z.infer<typeof addMeetingSchema> = {
  instructor: '',
}

function AddSubject() {
  const { addSubject } = useScheduleActions()

  const form = useForm<z.infer<typeof addSubjectSchema>>({
    resolver: zodResolver(addSubjectSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
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
          <div className='flex max-h-[500px] flex-col gap-4 overflow-y-scroll'>
            {/* General Subject Details */}
            <FieldSet>
              <FieldLegend>Add Subject</FieldLegend>
              <FieldDescription>Description</FieldDescription>
              <FieldGroup>
                <Controller
                  name='title'
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='add-subject_title'>
                          Subject Title
                        </FieldLabel>
                        <FieldDescription>Description</FieldDescription>
                        <Input
                          {...field}
                          id='add-subject_title'
                          placeholder='Lorem Ipsum'
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
                    <FieldGroup className='m-2 w-auto overflow-hidden rounded-md bg-teal-200 p-2'>
                      <Controller
                        name={`meetings.${index}.instructor`}
                        control={form.control}
                        render={({ field: controllerField, fieldState }) => {
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                htmlFor={`add-subject_meeting-instructor-${index}`}
                              >
                                Instructor
                              </FieldLabel>
                              <Input
                                {...controllerField}
                                id={`add-subject_meeting-instructor-${index}`}
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
          </div>
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
//                     <Field orientation='horizontal'>
//                       <FieldLabel
//                         htmlFor='startTimeHours'
//                         className='whitespace-nowrap'
//                       >
//                         Start Time
//                       </FieldLabel>
//                       <Input
//                         id='startTimeHours'
//                         type='number'
//                         placeholder='12'
//                         className='w-[75px]!'
//                       />
//                     </Field>
//                     <TextBody>:</TextBody>
//                     <Field>
//                       <Input
//                         id='startTimeMinutes'
//                         type='number'
//                         placeholder='00'
//                         className='w-[75px]!'
//                       />
//                     </Field>
//                   </div>
//                   <RadioGroup
//                     defaultValue='am'
//                     className='flex flex-row gap-0 divide-y rounded-md border'
//                   >
//                     <FieldLabel
//                       htmlFor='am'
//                       className='rounded-none! border-none hover:cursor-pointer'
//                     >
//                       <Field orientation='horizontal' className='py-2!'>
//                         <FieldContent>
//                           <FieldTitle>AM</FieldTitle>
//                         </FieldContent>
//                         <RadioGroupItem value='am' id='am' className='hidden' />
//                       </Field>
//                     </FieldLabel>
//                     <FieldLabel
//                       htmlFor='pm'
//                       className='rounded-none! border-none hover:cursor-pointer'
//                     >
//                       <Field orientation='horizontal' className='py-2!'>
//                         <FieldContent>
//                           <FieldTitle>PM</FieldTitle>
//                         </FieldContent>
//                         <RadioGroupItem value='pm' id='pm' className='hidden' />
//                       </Field>
//                     </FieldLabel>
//                   </RadioGroup>
//                 </div>
//               </FieldGroup>
//             </FieldGroup>
//           </FieldSet>
