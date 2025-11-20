import { create } from 'zustand'
import { CanvasEngine } from '../canvas-engine'

type CanvasEngineActions = {
  setEngine: (engine: CanvasEngine | null) => void
}

type CanvasEngineStoreState = {
  engine: CanvasEngine | null
  actions: CanvasEngineActions
}

const useCanvasEnginerStore = create<CanvasEngineStoreState>((set) => ({
  engine: null,
  actions: {
    setEngine: (engine) => {
      set({ engine })
    },
  },
}))

export function useCanvasEngine() {
  return useCanvasEnginerStore((state) => state.engine)
}

export function useCanvasEngineActions() {
  return useCanvasEnginerStore((state) => state.actions)
}
