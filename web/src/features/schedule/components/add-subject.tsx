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
import { Field } from '@/components/ui/field'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { CalendarPlusIcon } from 'lucide-react'
import SubjectForm, { SubjectFormValue } from './subject-form'
import { Meeting, Subject } from '../types'
import { normalizeTime } from '../lib/normalizeTime'

function isStringEmpty(str: unknown): boolean {
  return typeof str !== 'string' || str.trim().length === 0
}

function AddSubject() {
  const { addSubject } = useScheduleActions()

  const formId = 'add-subject'
  const defaultValues: SubjectFormValue = {
    title: '',
    // Add default colors to choose from
    color: '',
    meetings: [
      {
        type: '',
        instructor: '',
        location: '',
        days: [],
        startTime: { hours: 0, minutes: 0, meridiem: 'am' },
        endTime: { hours: 0, minutes: 0, meridiem: 'am' },
      },
    ],
  }

  function onSubmit(data: SubjectFormValue) {
    console.log('Submitted from <AddSubject/> : ', data)

    const newSubjectMeetings: Meeting[] = []
    data.meetings.forEach((meeting) => {
      newSubjectMeetings.push({
        /* Id creation is handled when persisting in context */
        id: '',
        days: meeting.days,
        startTime: normalizeTime(meeting.startTime),
        endTime: normalizeTime(meeting.endTime),
        type: isStringEmpty(meeting.type) ? undefined : meeting.type,
        instructor: isStringEmpty(meeting.instructor)
          ? undefined
          : meeting.instructor,
        location: isStringEmpty(meeting.location)
          ? undefined
          : meeting.location,
      })
    })

    const newSubject: Subject = {
      /* Id creation is handled when persisting in context */
      id: '',
      title: data.title,
      color: data.color,
      meetings: newSubjectMeetings,
    }

    /* Persist subject */
    addSubject(newSubject)
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

        <SubjectForm
          formId={formId}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />

        <DialogFooter>
          <Field orientation='horizontal'>
            <Button type='submit' form={formId}>
              Confirm
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubject
