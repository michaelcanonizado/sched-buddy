'use client'

import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import { useDisplay } from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'
import { Canvas } from 'fabric'
import { useEffect, useRef } from 'react'
import { useTimetableStyles } from '../store/use-schedule-store'
import { CanvasEngine } from '@/features/engine/canvas-engine'
import { Button } from '@/components/ui/button'

export default function ScheduleView({ className }: ComponentClassNameProp) {
  const display = useDisplay()
  const { ratio: deviceRatio } = getAspectRatio(
    display.dimensions.width,
    display.dimensions.height,
  )

  const timeTableStyles = useTimetableStyles()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<CanvasEngine | null>(null)

  /* Initialize canvas */
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const displayCanvas = new Canvas(canvasRef.current, {
      backgroundColor: '#ff0000',
      strokeWidth: 0,
    })
    engineRef.current = new CanvasEngine(displayCanvas)

    const container = containerRef.current
    const containerHeight = container.clientHeight
    // Height-first sizing
    const displayHeight = containerHeight
    const displayWidth = containerHeight * deviceRatio

    displayCanvas.setDimensions({
      width: displayWidth,
      height: displayHeight,
    })

    return () => {
      displayCanvas.dispose()
    }
  }, [timeTableStyles, display, deviceRatio])

  const addRectangle = () => {
    if (!engineRef.current) return
    engineRef.current.addRectangle()
  }

  return (
    <div
      ref={containerRef}
      className='absolute inset-4 grid place-items-center bg-pink-500'
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
          display.type !== 'phone' && display.type !== 'tablet'
            ? 'rounded-none'
            : 'rounded-2xl',
        )}
      >
        <canvas className='m-0 block p-0' ref={canvasRef} />
      </div>
    </div>
  )
}
