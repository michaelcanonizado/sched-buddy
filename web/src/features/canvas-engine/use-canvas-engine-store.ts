import { create } from 'zustand'
import { CanvasEngine } from './canvas-engine'

type CanvasEngineStoreActions = {
  setEngine: (engine: CanvasEngine | null) => void
}

type CanvasEngineStore = {
  engine: CanvasEngine | null
  actions: CanvasEngineStoreActions
}

const useCanvasEngineStore = create<CanvasEngineStore>()((set, get) => ({
  engine: null,
  actions: {
    setEngine: (engine) => set({ engine }),
  },
}))

export function useCanvasEngine() {
  return useCanvasEngineStore((state) => state.engine)
}

export function useSetCanvasEngine() {
  return useCanvasEngineStore((state) => state.actions.setEngine)
}
