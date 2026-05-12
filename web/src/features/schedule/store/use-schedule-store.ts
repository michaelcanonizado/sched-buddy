import displays, { Display } from '@/features/schedule/lib/displays'
import { create } from 'zustand'
import { scheduleData } from '../lib/mock-data'
import { persist } from 'zustand/middleware'
import { Day, Meeting, Subject } from '../types'
import { ExtractionResult } from '@/features/scanner/schemas'

type DisplayOrientation = 'portrait' | 'landscape'

type ScheduleStoreActions = {
  saveCORData: (data: ExtractionResult) => void
  addSubject: (subject: Subject) => void
  editSubject: (subject: Subject) => void
  deleteSubject: (subject: Subject) => void
  setDisplay: (display: Display | null) => void
  setOrientation: (orientation: DisplayOrientation) => void
  setHasHydrated: () => void
}

export type Settings = {
  timeFormat: '12' | '24'
  timeResolution: 30 | 60
  showWeekend: boolean
  startOfWeek: Extract<Day, 'sunday' | 'monday'>
}

export type ScheduleStoreState = {
  settings: Settings
  subjects: Subject[]
  display: Display | null
  orientation: DisplayOrientation
  hasHydrated: boolean
  actions: ScheduleStoreActions
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) =>
      ({
        settings: {
          timeFormat: '12',
          startOfWeek: 'monday',
          timeResolution: 30,
          showWeekend: false,
        },
        subjects: scheduleData,
        display: displays[0],
        hasHydrated: false,
        orientation: 'portrait',
        actions: {
          saveCORData: (data) => {
            const subjects: Subject[] = data.rows.map((subject) => {
              const meetings: Meeting[] = subject.schedules.map((meeting) => {
                return {
                  id: crypto.randomUUID(),
                  days: meeting.days,
                  startTime: meeting.time?.start ?? 0,
                  endTime: meeting.time?.end ?? 0,
                  type: '',
                  instructor: meeting.faculty ?? '',
                  location: meeting.room ?? '',
                }
              })

              return {
                id: crypto.randomUUID(),
                title: subject.subject ?? '',
                color: '#FFE37D',
                meetings,
              }
            })

            set(() => ({ subjects: subjects }))
          },
          addSubject: (subject) => {
            /* Assign ids. P.S. Checking for UUID collision is redundant. */
            subject.id = crypto.randomUUID()
            subject.meetings.forEach((meeting) => (meeting.id = crypto.randomUUID()))

            set((state) => ({ subjects: [...state.subjects, subject] }))
          },
          editSubject: (subject) => {
            const subjects = get().subjects
            const subjectToEditIndex = subjects.findIndex((s) => s.id === subject.id)

            if (subjectToEditIndex === -1) {
              throw new Error('Error persisting edited subject! Subject not found in context.')
            }

            /* Create a new copy of the array to not directly modify context using immutable update strategy which is safer for zustand */
            set({
              subjects: subjects.map((originalSubject) =>
                originalSubject.id === subject.id ? subject : originalSubject,
              ),
            })
          },
          deleteSubject: (subject) => {
            set((state) => ({
              subjects: state.subjects.filter((s) => s.id !== subject.id),
            }))
          },
          setDisplay: (display) => set({ display }),
          setOrientation: (orientation) => set({ orientation }),
          setHasHydrated: () => set({ hasHydrated: true }),
        },
      }) as ScheduleStoreState,
    {
      name: 'schedule-context',
      /* Fields to store in localStorage. Don't serialize actions! It cannot be serialized. */
      partialize: (state) => ({
        subjects: state.subjects,
        display: state.display,
        orientation: state.orientation,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Schedule Context hydrated!')
        state?.actions.setHasHydrated()
      },
    },
  ),
)

export function useScheduleHasHydrated() {
  return useScheduleStore((state) => state.hasHydrated)
}

export function useScheduleActions() {
  return useScheduleStore((state) => state.actions)
}
