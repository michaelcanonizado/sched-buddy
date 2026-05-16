import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { useEffect, useRef } from 'react'
import {
  useScheduleBackgroundImageContext,
  useScheduleDisplay,
  useScheduleHasHydrated,
  useScheduleStore,
} from '../store/use-schedule-store'
import { cn } from '@/lib/utils'
import {
  useCanvasEngine,
  useCanvasEngineActions,
  useCanvasEngineHasHydrated,
  useCanvasEngineStore,
} from '@/features/canvas-engine/use-canvas-engine-store'
import { useShallow } from 'zustand/shallow'
import { getBackgroundImageDB } from '../db/background-image'

export default function ScheduleView() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)

  const hasScheduleContextHydrated = useScheduleHasHydrated()
  const hasCanvasEngineContextHydrated = useCanvasEngineHasHydrated()

  const statesHydrated = hasScheduleContextHydrated && hasCanvasEngineContextHydrated

  const scheduleState = useScheduleStore(useShallow((s) => s))
  const scheduleBackgroundImageContext = useScheduleBackgroundImageContext()
  const scheduleDisplay = useScheduleDisplay()

  const canvasViewportState = useCanvasEngineStore(
    useShallow((s) => ({
      zoom: s.zoom,
      panX: s.panX,
      panY: s.panY,
      objectOverrides: s.objectOverrides,
    })),
  )

  const canvasEngine = useCanvasEngine()
  const { setEngine, setObjectOverride } = useCanvasEngineActions()

  /* On initial page load, wait for the context to be loaded from localStorage,
  then only create the engine */
  useEffect(() => {
    if (
      !statesHydrated ||
      !hasScheduleContextHydrated ||
      !canvasElementRef.current ||
      !canvasContainerRef.current ||
      /* CanvasEngine already exist */
      canvasEngine
    ) {
      return
    }

    const engine = new CanvasEngine(canvasElementRef.current)
    engine.setOnObjectModified(setObjectOverride)
    setEngine(engine)

    return () => {
      engine.dispose()
      setEngine(null)
    }
  }, [statesHydrated, setEngine])

  /* Change the schedule background image on change and on initial load */
  useEffect(() => {
    async function addBackgroundImage() {
      if (!statesHydrated || !canvasEngine) return

      /* States have hydrated but no stored background image context.
      So remove the background image from thee canvas */
      if (!scheduleBackgroundImageContext) {
        canvasEngine.removeBackgroundImage()
        return
      }

      const backgroundImageUrl = await getBackgroundImageDB()
      if (!backgroundImageUrl) return

      await canvasEngine.addBackgroundImage(backgroundImageUrl, scheduleBackgroundImageContext)
    }
    addBackgroundImage()
    /* scheduleDisplay is added here so that the image will be readded to the canvas.
    canvasEngine.render will not save the image object in the canvas if the display has changed */
  }, [scheduleBackgroundImageContext, canvasEngine, scheduleDisplay])

  /* Rerender the canvas when the states changes */
  useEffect(
    () => {
      if (
        !statesHydrated ||
        !canvasElementRef.current ||
        !canvasEngine ||
        !canvasContainerRef.current
      ) {
        return
      }

      const { clientWidth, clientHeight } = canvasContainerRef.current!

      canvasEngine.render(scheduleState, canvasViewportState)
      canvasEngine.resize(clientWidth, clientHeight)
    },
    /* Don't include canvasViewportState in the dependency array. This is an inteded behaviour.
     canvasViewportState changes on every FabricJS object:modified event! */
    [statesHydrated, scheduleState, canvasEngine],
  )

  /* Attach the resize listener */
  useEffect(() => {
    const handleResize = () => {
      if (!canvasEngine || !canvasElementRef.current || !canvasContainerRef.current) {
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
      className={cn('absolute inset-4 grid place-items-center overflow-scroll rounded-lg')}
    >
      <canvas ref={canvasElementRef} className={'rounded-lg'} />
    </div>
  )
}
