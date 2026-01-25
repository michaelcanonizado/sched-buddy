import { Display } from '@/features/display/lib/displays'
import { create } from 'zustand'
import { Subject } from '../lib/mock-data'
import { persist } from 'zustand/middleware'

type DisplayOrientation = 'portrait' | 'landscape'

type ScheduleStoreActions = {
  addSubject: () => void
  setDisplay: (display: Display | null) => void
  setOrientation: (orientation: DisplayOrientation) => void
  setHasHydrated: () => void
}

export type ScheduleStoreState = {
  subjects: Subject[]
  display: Display | null
  orientation: DisplayOrientation
  hasHydrated: boolean
  actions: ScheduleStoreActions
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) => ({
      subjects: [],
      display: null,
      hasHydrated: false,
      orientation: 'portrait',
      actions: {
        addSubject: () => {
          const subject: Subject = {
            title: 'Computer Programming 1',
            color: 'abc',
            meetings: [],
          }
          set((state) => ({ subjects: [...state.subjects, subject] }))
        },
        setDisplay: (display) => set({ display }),
        setOrientation: (orientation) => set({ orientation }),
        setHasHydrated: () => set({ hasHydrated: true }),
      },
    }),
    {
      name: 'sched-buddy-context',
      /* Fields to store in localStorage. Don't serialize actions! It cannot be serialized. */
      partialize: (state) => ({
        subjects: state.subjects,
        display: state.display,
        orientation: state.orientation,
        hasHydrated: state.hasHydrated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Context hydrated!')
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
