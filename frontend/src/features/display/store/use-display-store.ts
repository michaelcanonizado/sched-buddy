import { create } from 'zustand'
import displays, { Display } from '../lib/displays'

type Orientation = 'portrait' | 'landscape'

type DisplayStoreActions = {
  setDisplay: (display: Display) => void
  setOrientation: (orientation: Orientation) => void
}

type DisplayStoreState = {
  display: Display
  orientation: Orientation
  actions: DisplayStoreActions
}

const useDisplayStore = create<DisplayStoreState>((set) => ({
  display: displays[0],
  orientation: 'portrait',
  actions: {
    setDisplay: (display) => set({ display }),
    setOrientation: (orientation) => set({ orientation }),
  },
}))

export function useDisplay() {
  return useDisplayStore((state) => state.display)
}

export function useDisplayOrientation() {
  return useDisplayStore((state) => state.orientation)
}

export function useDisplayActions() {
  return useDisplayStore((state) => state.actions)
}
