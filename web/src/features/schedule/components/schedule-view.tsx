import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { useEffect, useRef } from 'react'
import {
  useScheduleHasHydrated,
  useScheduleStore,
} from '../store/use-schedule-store'
import { cn } from '@/lib/utils'

export default function ScheduleView() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const canvasEngineRef = useRef<CanvasEngine | null>(null)
  const hasContextHydrated = useScheduleHasHydrated()
  const state = useScheduleStore((s) => s)

  /* On initial page load, wait for the context to be loaded from localStorage,
  then only create the engine */
  useEffect(() => {
    if (
      !hasContextHydrated ||
      !canvasElementRef.current ||
      !canvasContainerRef.current
    )
      return

    const engine = new CanvasEngine(canvasElementRef.current)
    canvasEngineRef.current = engine

    const { clientWidth, clientHeight } = canvasContainerRef.current
    engine.resize(clientWidth, clientHeight)

    return () => engine.dispose()
  }, [hasContextHydrated])

  /* Rerender the canvas when the state changes */
  useEffect(() => {
    if (
      !hasContextHydrated ||
      !canvasElementRef.current ||
      !canvasEngineRef.current ||
      !canvasContainerRef.current
    )
      return

    const { clientWidth, clientHeight } = canvasContainerRef.current
    canvasEngineRef.current.render(state, clientWidth, clientHeight)
  }, [hasContextHydrated, state])

  /* Attach the resize listener */
  useEffect(() => {
    const handleResize = () => {
      if (
        !canvasEngineRef.current ||
        !canvasElementRef.current ||
        !canvasContainerRef.current
      ) {
        return
      }

      const { clientWidth, clientHeight } = canvasContainerRef.current
      canvasEngineRef.current.resize(clientWidth, clientHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={canvasContainerRef}
      className={cn(
        'absolute inset-4 grid place-items-center overflow-scroll rounded-lg',
        // 'border border-red-500',
      )}
    >
      <canvas ref={canvasElementRef} className='rounded-lg border' />
    </div>
  )
}
