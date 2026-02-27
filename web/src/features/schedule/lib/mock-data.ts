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
    title: 'Data Mining',
    color: '#FFE37D',
    meetings: [
      {
        days: ['monday'],
        startTime: 600,
        endTime: 720,
        instructor: 'Sy, C.',
        location: 'BUCS-101',
      },
      {
        days: ['wednesday'],
        startTime: 780,
        endTime: 1140,
        instructor: 'Sy, C.',
        location: 'BUCS-215',
      },
    ],
  },
  {
    title: 'Information Assurance and Security',
    color: '#C8F7C5',
    meetings: [
      {
        days: ['tuesday'],
        startTime: 780,
        endTime: 870,
        instructor: 'Brogada, M.',
        location: 'BUCS-302',
      },
    ],
  },
  {
    title: 'Human Computer Interaction',
    color: '#E08283',
    meetings: [
      {
        days: ['tuesday'],
        startTime: 1020,
        endTime: 1140,
        instructor: 'Canon, M.',
        location: 'BUCS-118',
      },
    ],
  },
  {
    title: 'Networks and Communications',
    color: '#99CCCC',
    meetings: [
      {
        days: ['monday'],
        startTime: 780,
        endTime: 960,
        instructor: 'Brogada, M.',
        location: 'BUCS-404',
      },
    ],
  },
  {
    title: 'Science, Technology, and Society',
    color: '#CC99CC',
    meetings: [
      {
        days: ['thursday'],
        startTime: 540,
        endTime: 720,
        instructor: 'Conda-Botin, K.',
        location: 'BUCS-207',
      },
    ],
  },
  {
    title: 'Networks and Communiations',
    color: '#C4DA87',
    meetings: [
      {
        days: ['thursday', 'sunday'],
        startTime: 780,
        endTime: 900,
        instructor: 'Brogada, M.',
        location: 'BUCS-320',
      },
    ],
  },
  {
    title: 'Ethics',
    color: '#F7B891',
    meetings: [
      {
        days: ['thursday'],
        startTime: 1020,
        endTime: 1200,
        instructor: 'Orpano, J.',
        location: 'BUCS-112',
      },
    ],
  },
  {
    title: 'Software Engineering 2',
    color: '#FFDDFF',
    meetings: [
      {
        days: ['friday'],
        startTime: 540,
        endTime: 720,
        instructor: 'Maceda, L.',
        location: 'BUCS-401',
      },
      {
        days: ['friday'],
        startTime: 780,
        endTime: 1140,
        instructor: 'Maceda, L.',
        location: 'BUCS-219',
      },
    ],
  },
]
