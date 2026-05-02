'use client'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { XIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import formatDay from '../lib/format-day'
import { TextBody, TextHeadingSM } from '@/components/text'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import z from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Day } from '../types'
import { ComponentClassNameProp } from '@/types'

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

const meetingFormSchema = z.object({
  type: z.string(),
  instructor: z.string(),
  location: z.string(),
  days: z.array(z.enum(days)).min(1, 'At least one day must be selected.'),
  startTime: timeSchema,
  endTime: timeSchema,
})
export type MeetingFormValue = z.infer<typeof meetingFormSchema>

const subjectFormSchema = z.object({
  title: z.string().min(1, 'Subject title is required'),
  color: z.string().min(1, 'Color is required'),
  meetings: z.array(meetingFormSchema).min(1, 'Add at least one meeting.'),
})
export type SubjectFormValue = z.infer<typeof subjectFormSchema>

const defaultMeeting: MeetingFormValue = {
  type: '',
  instructor: '',
  location: '',
  days: [],
  startTime: { hours: 0, minutes: 0, meridiem: 'am' },
  endTime: { hours: 0, minutes: 0, meridiem: 'am' },
}

function SubjectForm({
  formId,
  defaultValues,
  onSubmit,
}: {
  formId: string
  defaultValues: SubjectFormValue
  onSubmit: (data: SubjectFormValue) => void
}) {
  const form = useForm<SubjectFormValue>({
    resolver: zodResolver(subjectFormSchema),
    mode: 'onSubmit',
    defaultValues,
  })

  const {
    fields: meetings,
    append: appendMeeting,
    remove: removeMeeting,
  } = useFieldArray({
    control: form.control,
    name: 'meetings',
  })

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className='bg-muted flex max-h-[500px] flex-col gap-8 overflow-y-scroll p-8'>
        {/* General Subject Details */}
        <FieldSet>
          <FieldGroup>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='title'
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation='vertical'
                    >
                      <FieldLabel
                        htmlFor='subject-form_title'
                        className='whitespace-nowrap'
                      >
                        Subject Title
                      </FieldLabel>

                      <Input
                        {...field}
                        id='subject-form_title'
                        placeholder='Mathematics in the Modern World'
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
              <Controller
                name='color'
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation='vertical'
                    >
                      <FieldLabel
                        htmlFor='subject-form_color'
                        className='whitespace-nowrap'
                      >
                        Color
                      </FieldLabel>

                      <Input
                        {...field}
                        id='subject-form_color'
                        placeholder='#f4f4f4'
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
            </div>
          </FieldGroup>
        </FieldSet>

        {/* Meeting details */}
        <div className='flex flex-col gap-8'>
          {meetings.map((field, index) => {
            return (
              <FieldSet
                key={field.id}
                className='bg-background w-full overflow-hidden rounded-xl border'
              >
                <div className='flex items-center justify-between border-b px-6 py-4'>
                  <TextHeadingSM>Meeting {index + 1}</TextHeadingSM>
                  {meetings.length > 1 && (
                    <Button
                      type='button'
                      size='icon'
                      className='border-none'
                      onClick={() => removeMeeting(index)}
                      aria-label={`Remove meeting ${index + 1}`}
                    >
                      <XIcon className='stroke-white' />
                    </Button>
                  )}
                </div>
                <div className='w-auto overflow-hidden'>
                  <div className='flex flex-col items-center gap-6 border-b p-6'>
                    <Controller
                      name={`meetings.${index}.days`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <div className='flex flex-col gap-2'>
                            <FieldGroup
                              data-slot='checkbox-group'
                              className='flex flex-row justify-center !gap-6'
                            >
                              {days.map((day) => {
                                return (
                                  <Field
                                    key={`subject-form_meetings.${index}.day.${day}`}
                                    data-invalid={fieldState.invalid}
                                    orientation='vertical'
                                    className='w-fit items-center [&>*]:w-min'
                                  >
                                    <FieldLabel
                                      htmlFor={`subject-form_meetings.${index}.day.${day}`}
                                      className={cn(
                                        'hover:cursor-pointer',
                                        'grid !size-[42px] place-items-center rounded-lg border',
                                        controllerField.value.includes(day) &&
                                          'border-brand-yellow bg-brand-yellow/60 border-2',
                                      )}
                                      defaultChecked
                                    >
                                      {formatDay(day, 'title', true)}
                                    </FieldLabel>
                                    <Checkbox
                                      name={controllerField.name}
                                      id={`subject-form_meetings.${index}.day.${day}`}
                                      className='hidden'
                                      checked={controllerField.value.includes(
                                        day,
                                      )}
                                      onCheckedChange={(checked) => {
                                        const newValues = checked
                                          ? [...controllerField.value, day]
                                          : controllerField.value.filter(
                                              (value) => value !== day,
                                            )
                                        controllerField.onChange(newValues)
                                      }}
                                    />
                                  </Field>
                                  // <Field
                                  //   key={`subject-form_meetings.${index}.day.${day}`}
                                  //   data-invalid={fieldState.invalid}
                                  //   orientation='vertical'
                                  //   className='w-fit items-center [&>*]:w-min'
                                  // >
                                  //   <FieldLabel
                                  //     htmlFor={`subject-form_meetings.${index}.day.${day}`}
                                  //     className='font-normal hover:cursor-pointer'
                                  //     defaultChecked
                                  //   >
                                  //     {formatDay(day, 'title', true)}
                                  //   </FieldLabel>
                                  //   <Checkbox
                                  //     name={controllerField.name}
                                  //     id={`subject-form_meetings.${index}.day.${day}`}
                                  //     className='relative size-8! rounded-lg'
                                  //     checked={controllerField.value.includes(
                                  //       day,
                                  //     )}
                                  //     onCheckedChange={(checked) => {
                                  //       const newValues = checked
                                  //         ? [...controllerField.value, day]
                                  //         : controllerField.value.filter(
                                  //             (value) => value !== day,
                                  //           )
                                  //       controllerField.onChange(newValues)
                                  //     }}
                                  //   />
                                  // </Field>
                                )
                              })}
                            </FieldGroup>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </div>
                        )
                      }}
                    />

                    {/* <Controller
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
                    /> */}
                    <div className='h-[100px] w-full' />
                  </div>

                  <div className='flex flex-row gap-4 p-6'>
                    <Controller
                      name={`meetings.${index}.type`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            orientation='vertical'
                          >
                            <FieldLabel
                              htmlFor={`subject-form_meetings.${index}.type`}
                            >
                              Type
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.type`}
                              placeholder='Lab'
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

                    <Controller
                      name={`meetings.${index}.instructor`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            orientation='vertical'
                          >
                            <FieldLabel
                              htmlFor={`subject-form_meetings.${index}.instructor`}
                            >
                              Instructor
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.instructor`}
                              placeholder='Prof. John Doe'
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

                    <Controller
                      name={`meetings.${index}.location`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            orientation='vertical'
                          >
                            <FieldLabel
                              htmlFor={`subject-form_meetings.${index}.location`}
                            >
                              Location
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.location`}
                              placeholder='BUCS B2-201'
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
                  </div>
                </div>
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
  )
}

export default SubjectForm

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
