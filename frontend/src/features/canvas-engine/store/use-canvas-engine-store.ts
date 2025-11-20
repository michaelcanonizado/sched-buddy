import { create } from 'zustand'
import { CanvasEngine } from '../canvas-engine'

type CanvasEngineActions = {
  setCanvasEngine: (canvasEngine: CanvasEngine | null) => void
}

type CanvasEngineStoreState = {
  canvasEngine: CanvasEngine | null
  actions: CanvasEngineActions
}

const useCanvasEnginerStore = create<CanvasEngineStoreState>((set) => ({
  canvasEngine: null,
  actions: {
    setCanvasEngine: (canvasEngine) => set({ canvasEngine }),
  },
}))

export function useCanvasEngine() {
  return useCanvasEnginerStore((state) => state.canvasEngine)
}

export function useCanvasEngineActions() {
  return useCanvasEnginerStore((state) => state.actions)
}
