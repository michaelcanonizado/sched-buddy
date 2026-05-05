import { MeetingFormValue, SubjectFormValue } from '../components/subject-form'
import { Meeting, Subject } from '../types'
import { normalizeTime } from './normalizeTime'
import { denormalizeTime } from './denormalizeTime'

function isStringEmpty(str: unknown): boolean {
  return typeof str !== 'string' || str.trim().length === 0
}

export function subjectFromFormValues(formValues: SubjectFormValue, id?: string): Subject {
  const newSubjectMeetings: Meeting[] = []
  formValues.meetings.forEach((meeting) => {
    newSubjectMeetings.push({
      /* Id creation is handled when persisting in context */
      id: '',
      days: meeting.days,
      startTime: normalizeTime(meeting.startTime),
      endTime: normalizeTime(meeting.endTime),
      type: isStringEmpty(meeting.type) ? undefined : meeting.type,
      instructor: isStringEmpty(meeting.instructor) ? undefined : meeting.instructor,
      location: isStringEmpty(meeting.location) ? undefined : meeting.location,
    })
  })

  return {
    /* Id creation is handled when persisting in context */
    id: !id ? '' : id,
    title: formValues.title,
    color: formValues.color,
    meetings: newSubjectMeetings,
  }
}

export function subjectToFormValues(subject: Subject): SubjectFormValue {
  const meetingsFormValues: MeetingFormValue[] = []

  subject.meetings.forEach((meeting) => {
    meetingsFormValues.push({
      days: meeting.days,
      startTime: denormalizeTime(meeting.startTime),
      endTime: denormalizeTime(meeting.endTime),
      type: !meeting.type ? '' : meeting.type,
      instructor: !meeting.instructor ? '' : meeting.instructor,
      location: !meeting.location ? '' : meeting.location,
    })
  })

  return {
    title: subject.title,
    color: subject.color,
    meetings: meetingsFormValues,
  }
}
