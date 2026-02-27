export type Day =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

/* minutes since midnight (0[00:00] -> 1,439[23:59]) */
export type Time = number

export type Meeting = {
  days: Day[]
  startTime: Time
  endTime: Time
  instructor: string
  location: string
}

export type Subject = {
  title: string
  color: string
  meetings: Meeting[]
}

export const scheduleData: Subject[] = [
  {
    title: 'Operating Systems',
    color: '#FFE37D',
    meetings: [
      {
        days: ['tuesday', 'thursday'],
        startTime: 540,
        endTime: 750,
        instructor: 'Canon, M',
        location: 'CS-02-201',
      },
    ],
  },
]
