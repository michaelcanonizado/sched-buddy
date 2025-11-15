import { create } from 'zustand'

type ScheduleStoreActions = {
  setTimetableStylesMargins: ({ x, y }: { x?: number; y?: number }) => void
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
      x: 16,
      y: 16,
    },
  },

  actions: {
    setTimetableStylesMargins: ({ x, y }: { x?: number; y?: number }) => {
      set((state) => ({
        timetableStyles: {
          ...state.timetableStyles,
          margins: {
            x: x !== undefined ? x : state.timetableStyles.margins.x,
            y: y !== undefined ? y : state.timetableStyles.margins.y,
          },
        },
      }))
    },
  },
}))

export function useTimetableStyles() {
  return useScheduleStore((state) => state.timetableStyles)
}

export function useScheduleActions() {
  return useScheduleStore((state) => state.actions)
}
