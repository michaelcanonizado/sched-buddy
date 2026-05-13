export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

/* minutes since midnight (0[00:00] -> 1,439[23:59]) */
export type Time = number

export type Meeting = {
  id: string
  days: Day[]
  startTime: Time
  endTime: Time
  instructor?: string
  location?: string
  type?: string
}

export type Subject = {
  id: string
  title: string
  color: string
  meetings: Meeting[]
}
