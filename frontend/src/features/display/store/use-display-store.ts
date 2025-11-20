import { create } from 'zustand'
import { Display } from '../lib/displays'

type Orientation = 'portrait' | 'landscape'

type DisplayStoreActions = {
  setDisplay: (display: Display | null) => void
  setOrientation: (orientation: Orientation) => void
}

type DisplayStoreState = {
  display: Display | null
  orientation: Orientation
  actions: DisplayStoreActions
}

const useDisplayStore = create<DisplayStoreState>((set) => ({
  display: null,
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
