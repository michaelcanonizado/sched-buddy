'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { XIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import formatDay from '../lib/format-day'
import { TextHeadingSM } from '@/components/text'
import z from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Day } from '../types'
import { TimePicker } from '@/components/time-picker'
import ColorPicker from '@/components/color-picker'
import { ComponentClassNameProp } from '@/types'
import { useRef } from 'react'

const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/* Verify hours and minutes on form submit! */
const timeSchema = z
  .object({
    hours: z.union([
      z.number().min(1, 'minimum hour is 1').max(12, 'max hour is 12'),
      z.undefined(),
    ]),
    minutes: z.union([
      z.number().min(0, 'minimum minute is 0').max(59, 'max minute is 59'),
      z.undefined(),
    ]),
    meridiem: z.enum(['AM', 'PM'], 'Choose a meridiem'),
  })
  .superRefine((data, ctx) => {
    if (data.hours === undefined && data.minutes === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Time is required',
        path: [],
      })
    }

    if (data.hours === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Hours is required',
        path: [],
      })
    }

    if (data.minutes === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Minutes is required',
        path: [],
      })
    }
  })

export type TimeFormValue = z.infer<typeof timeSchema>

const meetingFormSchema = z.object({
  type: z.string(),
  instructor: z.string(),
  location: z.string(),
  days: z.array(z.enum(days)).min(1, 'Select at least one day'),
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

const emptyMeeting: MeetingFormValue = {
  type: '',
  instructor: '',
  location: '',
  days: [],
  startTime: { hours: undefined, minutes: undefined, meridiem: 'AM' },
  endTime: { hours: undefined, minutes: undefined, meridiem: 'AM' },
}

const emptySubject = {
  title: '',
  color: '#FB8500',
  meetings: [emptyMeeting],
}

function SubjectForm({
  formId,
  defaultValues = emptySubject,
  onSubmit,
  className,
}: {
  formId: string
  defaultValues?: SubjectFormValue
  onSubmit: (data: SubjectFormValue) => void
} & ComponentClassNameProp) {
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
      <FieldGroup
        className={cn(
          'bg-muted flex max-h-[500px] flex-col gap-8 overflow-y-scroll p-8',
          className,
        )}
      >
        {/* General Subject Details */}
        <FieldSet>
          <FieldGroup>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                name='title'
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} orientation='vertical'>
                      <FieldLabel htmlFor='subject-form_title' className='whitespace-nowrap'>
                        Subject Title
                      </FieldLabel>

                      <Input
                        {...field}
                        id='subject-form_title'
                        placeholder='Mathematics in the Modern World'
                        autoComplete='off'
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )
                }}
              />
              <Controller
                name='color'
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid} orientation='vertical'>
                      <FieldLabel htmlFor='subject-form_color' className='whitespace-nowrap'>
                        Color
                      </FieldLabel>
                      <ColorPicker hex={field.value} onHexChange={field.onChange} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                                      checked={controllerField.value.includes(day)}
                                      onCheckedChange={(checked) => {
                                        const newValues = checked
                                          ? [...controllerField.value, day]
                                          : controllerField.value.filter((value) => value !== day)
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
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </div>
                        )
                      }}
                    />

                    <Controller
                      name={`meetings.${index}.startTime`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field
                            data-invalid={fieldState.invalid}
                            className='flex flex-col items-center gap-2 *:text-center'
                          >
                            <div className='flex flex-row justify-center gap-2'>
                              <FieldLabel
                                htmlFor={`meetings.${index}.startTime`}
                                className='w-min! whitespace-nowrap'
                              >
                                Start Time
                              </FieldLabel>
                              <TimePicker
                                id={`meetings.${index}.startTime`}
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                aria-invalid={fieldState.invalid}
                              />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                            className='flex flex-col items-center gap-2 *:text-center'
                          >
                            <div className='flex flex-row justify-center gap-2'>
                              <FieldLabel
                                htmlFor={`meetings.${index}.endTime`}
                                className='w-min! whitespace-nowrap'
                              >
                                End Time
                              </FieldLabel>
                              <TimePicker
                                id={`meetings.${index}.endTime`}
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                aria-invalid={fieldState.invalid}
                              />
                            </div>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )
                      }}
                    />
                  </div>

                  <div className='flex flex-row gap-4 p-6'>
                    <Controller
                      name={`meetings.${index}.type`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field data-invalid={fieldState.invalid} orientation='vertical'>
                            <FieldLabel htmlFor={`subject-form_meetings.${index}.type`}>
                              Type
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.type`}
                              placeholder='Lab'
                              autoComplete='off'
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )
                      }}
                    />

                    <Controller
                      name={`meetings.${index}.instructor`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field data-invalid={fieldState.invalid} orientation='vertical'>
                            <FieldLabel htmlFor={`subject-form_meetings.${index}.instructor`}>
                              Instructor
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.instructor`}
                              placeholder='Prof. John Doe'
                              autoComplete='off'
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )
                      }}
                    />

                    <Controller
                      name={`meetings.${index}.location`}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => {
                        return (
                          <Field data-invalid={fieldState.invalid} orientation='vertical'>
                            <FieldLabel htmlFor={`subject-form_meetings.${index}.location`}>
                              Location
                            </FieldLabel>
                            <Input
                              {...controllerField}
                              id={`subject-form_meetings.${index}.location`}
                              placeholder='BUCS B2-201'
                              autoComplete='off'
                              aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
          onClick={() => appendMeeting(emptyMeeting)}
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
