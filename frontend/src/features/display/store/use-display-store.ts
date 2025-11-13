import { create } from 'zustand'
import displays, { Display } from '../lib/displays'

type DisplayStoreActions = {
  setDisplay: (display: Display) => void
}

type DisplayStoreState = {
  display: Display
  actions: DisplayStoreActions
}

const useDisplayStore = create<DisplayStoreState>((set) => ({
  display: displays[0],
  actions: {
    setDisplay: (display) => set({ display }),
  },
}))

export function useDisplay() {
  return useDisplayStore((state) => state.display)
}

export function useDisplayActions() {
  return useDisplayStore((state) => state.actions)
}
