'use client'

import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import { useDisplay } from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'
import { Canvas } from 'fabric'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { Button } from '@/components/ui/button'
import {
  useCanvasEngine,
  useCanvasEngineActions,
} from '@/features/canvas-engine/store/use-canvas-engine-store'

export default function ScheduleView() {
  const display = useDisplay()
  const displayRatio = useMemo(() => {
    if (!display) return null

    const { ratio } = getAspectRatio(
      display.dimensions.width,
      display.dimensions.height,
    )
    return ratio
  }, [display])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasEngine = useCanvasEngine()
  const { setCanvasEngine } = useCanvasEngineActions()

  /* Initialize canvas engine */
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const displayCanvas = new Canvas(canvasRef.current, {
      backgroundColor: '#ff0000',
      strokeWidth: 0,
    })
    setCanvasEngine(new CanvasEngine(displayCanvas))

    return () => {
      displayCanvas.dispose()
      setCanvasEngine(null)
    }
  }, [setCanvasEngine])

  useEffect(() => {
    if (!canvasEngine || !containerRef.current) return
    if (display && displayRatio) {
      canvasEngine.setVariant({
        variant: 'with-display',
        height: containerRef.current.clientHeight,
        ratio: displayRatio,
      })
    } else {
      canvasEngine.setVariant({
        variant: 'without-display',
        height: containerRef.current.clientHeight,
      })
    }
  }, [canvasEngine, displayRatio, display])

  const addRectangle = () => {
    if (!canvasEngine) return
    canvasEngine.addRectangle()
  }

  useEffect(() => {
    console.log('rendering /schedule')
  }, [])

  return (
    <div
      ref={containerRef}
      className='absolute inset-4 grid place-items-center'
    >
      <div className='absolute top-0 right-0'>
        <Button variant={'outline'} onClick={addRectangle}>
          Add Rectangle
        </Button>
      </div>
      <div
        className={cn(
          'size-fit overflow-hidden rounded-xl',
          // 'border-2',
          display
            ? display.type !== 'phone' && display.type !== 'tablet'
              ? 'rounded-none'
              : 'rounded-2xl'
            : 'rounded-none',
        )}
      >
        <canvas className='m-0 block p-0' ref={canvasRef} />
      </div>
    </div>
  )
}
