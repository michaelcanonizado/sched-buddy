import { create } from 'zustand'

type ScheduleStoreActions = {
  setTimetableMargins: (x: number, y: number) => void
}

type ScheduleStoreState = {
  timetableStyles: {
    margins: {
      x: number
      y: number
    }
  }
  actions: ScheduleStoreActions
}

const useScheduleStore = create<ScheduleStoreState>((set) => ({
  timetableStyles: {
    margins: {
      x: 0,
      y: 0,
    },
  },

  actions: {
    setTimetableMargins: (x, y) =>
      set({ timetableStyles: { margins: { x, y } } }),
  },
}))

export function useTimetableStyles() {
  return useScheduleStore((state) => state.timetableStyles)
}

export function useScheduleActions() {
  return useScheduleStore((state) => state.actions)
}
