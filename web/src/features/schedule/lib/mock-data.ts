type Days = {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

type Meeting = {
  days: Days
  startTime: {
    hours: number
    minutes: number
  }
  endTime: {
    hours: number
    minutes: number
  }
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
        days: {
          monday: false,
          tuesday: true,
          wednesday: false,
          thursday: true,
          friday: false,
          saturday: false,
          sunday: false,
        },
        startTime: {
          hours: 9,
          minutes: 0,
        },
        endTime: {
          hours: 12,
          minutes: 30,
        },
        instructor: 'Canon, M',
        location: 'CS-02-201',
      },
    ],
  },
]
