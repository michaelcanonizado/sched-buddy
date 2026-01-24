import { Display } from '@/features/display/lib/displays'
import { create } from 'zustand'
import { Subject } from '../lib/mock-data'

type DisplayOrientation = 'portrait' | 'landscape'

type ScheduleStoreActions = {
  setDisplay: (display: Display | null) => void
  setOrientation: (orientation: DisplayOrientation) => void
}

type ScheduleStoreState = {
  subjects: Subject[]
  display: Display | null
  orientation: DisplayOrientation
  actions: ScheduleStoreActions
}

export const useScheduleStore = create<ScheduleStoreState>((set, get) => ({
  subjects: [],
  display: null,
  orientation: 'portrait',
  actions: {
    setDisplay: (display) => set({ display }),
    setOrientation: (orientation) => set({ orientation }),
  },
}))

export function useScheduleDisplay() {
  return useScheduleStore((state) => state.display)
}

export function useScheduleDisplayOrientation() {
  return useScheduleStore((state) => state.orientation)
}

export function useScheduleActions() {
  return useScheduleStore((state) => state.actions)
}
