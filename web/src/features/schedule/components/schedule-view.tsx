import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { useEffect, useRef } from 'react'
import {
  useScheduleHasHydrated,
  useScheduleStore,
} from '../store/use-schedule-store'
import { cn } from '@/lib/utils'
import {
  useCanvasEngine,
  useSetCanvasEngine,
} from '@/features/canvas-engine/use-canvas-engine-store'

export default function ScheduleView() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  // const canvasEngineRef = useRef<CanvasEngine | null>(null)
  const hasContextHydrated = useScheduleHasHydrated()
  const scheduleState = useScheduleStore((s) => s)
  const canvasEngine = useCanvasEngine()
  const setCanvasEngine = useSetCanvasEngine()

  /* On initial page load, wait for the context to be loaded from localStorage,
  then only create the engine */
  useEffect(() => {
    if (
      !hasContextHydrated ||
      !canvasElementRef.current ||
      !canvasContainerRef.current ||
      /* CanvasEngine already exist */
      canvasEngine
    )
      return

    const engine = new CanvasEngine(canvasElementRef.current)
    setCanvasEngine(engine)

    const { clientWidth, clientHeight } = canvasContainerRef.current
    engine.resize(clientWidth, clientHeight)

    return () => {
      engine.dispose()
      setCanvasEngine(null)
    }
  }, [hasContextHydrated, setCanvasEngine])

  /* Rerender the canvas when the state changes */
  useEffect(() => {
    if (
      !hasContextHydrated ||
      !canvasElementRef.current ||
      !canvasEngine ||
      !canvasContainerRef.current
    )
      return

    const { clientWidth, clientHeight } = canvasContainerRef.current
    canvasEngine.render(scheduleState)
    canvasEngine.resize(clientWidth, clientHeight)
  }, [hasContextHydrated, scheduleState, canvasEngine])

  /* Attach the resize listener */
  useEffect(() => {
    const handleResize = () => {
      if (
        !canvasEngine ||
        !canvasElementRef.current ||
        !canvasContainerRef.current
      ) {
        return
      }

      const { clientWidth, clientHeight } = canvasContainerRef.current
      canvasEngine.resize(clientWidth, clientHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [canvasEngine])

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
