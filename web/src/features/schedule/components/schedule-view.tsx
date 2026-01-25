import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { useEffect, useRef } from 'react'
import {
  useScheduleHasHydrated,
  useScheduleStore,
} from '../store/use-schedule-store'

export default function ScheduleView() {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const canvasEngineRef = useRef<CanvasEngine | null>(null)
  const hasContextHydrated = useScheduleHasHydrated()
  const state = useScheduleStore((s) => s)

  /* On initial page load, wait for the context to be loaded from localStorage,
  then only create the engine */
  useEffect(() => {
    if (!hasContextHydrated || !canvasElementRef.current) return

    const engine = new CanvasEngine(canvasElementRef.current)
    canvasEngineRef.current = engine

    return () => engine.dispose()
  }, [hasContextHydrated])

  /* Rerender the canvas when the state changes */
  useEffect(() => {
    if (
      !hasContextHydrated ||
      !canvasElementRef.current ||
      !canvasEngineRef.current
    )
      return
    canvasEngineRef.current.render(state)
  }, [hasContextHydrated, state])

  return (
    <div className='h-full w-full'>
      <canvas ref={canvasElementRef} />
    </div>
  )
}
