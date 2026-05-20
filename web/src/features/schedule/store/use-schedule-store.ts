import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Day, Meeting, Subject } from '../types'
import { ExtractionResult } from '@/features/scanner/schemas'
import { createUniqueColorGenerator } from '../lib/default-meeting-colors'

type ScheduleStoreActions = {
  setTitle: (title: string) => void
  saveCORData: (data: ExtractionResult) => void
  addSubject: (subject: Subject) => void
  editSubject: (subject: Subject) => void
  deleteSubject: (subject: Subject) => void
  setBackgroundImageContext: (context: BackgroundImageContext | null) => void
  setBackgroundFill: (hex: string | null) => void
  setDimension: (dimension: Dimension) => void
  setHasHydrated: () => void
}

export type Settings = {
  timeFormat: '12' | '24'
  timeResolution: 30 | 60
  showWeekend: boolean
  startOfWeek: Extract<Day, 'sunday' | 'monday'>
}

export type BackgroundImageContext = {
  cropArea: {
    width: number
    height: number
    x: number
    y: number
  }
  originalDimension: {
    width: number
    height: number
  }
}

export type Dimension = {
  id: string | 'custom'
  width: number
  height: number
}

export type ScheduleStoreState = {
  title: string
  settings: Settings
  subjects: Subject[]
  background: {
    imageContext: BackgroundImageContext | null
    fill: string | null
  }

  dimension: Dimension

  hasHydrated: boolean
  actions: ScheduleStoreActions
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) =>
      ({
        title: '',
        settings: {
          timeFormat: '12',
          startOfWeek: 'monday',
          timeResolution: 30,
          showWeekend: false,
        },
        subjects: [],
        backgroundImageContext: null,
        background: {
          imageContext: null,
          fill: '#e3463b',
        },
        dimension: {
          id: 'custom',
          width: 1125,
          height: 2436,
        },
        hasHydrated: false,
        actions: {
          setTitle: (title) => set({ title }),
          saveCORData: (data) => {
            const getRandomColor = createUniqueColorGenerator()

            const subjects: Subject[] = data.data.map((subject) => {
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
                color: getRandomColor(),
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

          setBackgroundImageContext: (context) =>
            set({ background: { ...get().background, imageContext: context } }),
          setBackgroundFill: (hex) => set({ background: { ...get().background, fill: hex } }),

          setDimension: (dimension) => set({ dimension }),
          setHasHydrated: () => set({ hasHydrated: true }),
        },
      }) as ScheduleStoreState,
    {
      name: 'schedule-context',
      /* Fields to store in localStorage. Don't serialize actions! It cannot be serialized. */
      partialize: (state) => ({
        title: state.title,
        subjects: state.subjects,
        dimension: state.dimension,
        background: state.background,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.actions.setHasHydrated()
      },
    },
  ),
)

export function useScheduleHasHydrated() {
  return useScheduleStore((state) => state.hasHydrated)
}

export function useScheduleBackgroundImageContext() {
  return useScheduleStore((state) => state.background.imageContext)
}

export function useScheduleDimension() {
  return useScheduleStore((state) => state.dimension)
}

export function useScheduleActions() {
  return useScheduleStore((state) => state.actions)
}
