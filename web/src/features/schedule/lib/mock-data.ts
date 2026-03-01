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
  id: string
  days: Day[]
  startTime: Time
  endTime: Time
  instructor: string
  location: string
}

export type Subject = {
  id: string
  title: string
  color: string
  meetings: Meeting[]
}

export const scheduleData: Subject[] = [
  {
    id: '1',
    title: 'Data Mining',
    color: '#FFE37D',
    meetings: [
      {
        id: '1',
        days: ['monday'],
        startTime: 600,
        endTime: 720,
        instructor: 'Sy, C.',
        location: 'BUCS-101',
      },
      {
        id: '2',
        days: ['wednesday'],
        startTime: 780,
        endTime: 1140,
        instructor: 'Sy, C.',
        location: 'BUCS-215',
      },
    ],
  },
  {
    id: '2',
    title: 'Information Assurance and Security',
    color: '#C8F7C5',
    meetings: [
      {
        id: '3',
        days: ['tuesday'],
        startTime: 780,
        endTime: 870,
        instructor: 'Brogada, M.',
        location: 'BUCS-302',
      },
    ],
  },
  {
    id: '3',
    title: 'Human Computer Interaction',
    color: '#E08283',
    meetings: [
      {
        id: '4',
        days: ['tuesday'],
        startTime: 1020,
        endTime: 1140,
        instructor: 'Canon, M.',
        location: 'BUCS-118',
      },
    ],
  },
  {
    id: '4',
    title: 'Networks and Communications',
    color: '#99CCCC',
    meetings: [
      {
        id: '5',
        days: ['monday'],
        startTime: 780,
        endTime: 960,
        instructor: 'Brogada, M.',
        location: 'BUCS-404',
      },
    ],
  },
  {
    id: '5',
    title: 'Science, Technology, and Society',
    color: '#CC99CC',
    meetings: [
      {
        id: '6',
        days: ['thursday'],
        startTime: 540,
        endTime: 720,
        instructor: 'Conda-Botin, K.',
        location: 'BUCS-207',
      },
    ],
  },
  {
    id: '6',
    title: 'Networks and Communiations',
    color: '#C4DA87',
    meetings: [
      {
        id: '7',
        days: ['thursday'],
        startTime: 780,
        endTime: 900,
        instructor: 'Brogada, M.',
        location: 'BUCS-320',
      },
    ],
  },
  {
    id: '7',
    title: 'Ethics',
    color: '#F7B891',
    meetings: [
      {
        id: '8',
        days: ['thursday'],
        startTime: 1020,
        endTime: 1200,
        instructor: 'Orpano, J.',
        location: 'BUCS-112',
      },
    ],
  },
  {
    id: '8',
    title: 'Software Engineering 2',
    color: '#FFDDFF',
    meetings: [
      {
        id: '9',
        days: ['friday'],
        startTime: 540,
        endTime: 720,
        instructor: 'Maceda, L.',
        location: 'BUCS-401',
      },
      {
        id: '1a',
        days: ['friday'],
        startTime: 780,
        endTime: 1140,
        instructor: 'Maceda, L.',
        location: 'BUCS-219',
      },
    ],
  },
]
