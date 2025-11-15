'use client'

import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import { useDisplay } from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'
import { Canvas, Group, Rect, Text } from 'fabric'
import { useEffect, useRef, useState } from 'react'
import { useTimetableStyles } from '../store/use-schedule-store'

export default function ScheduleView({ className }: ComponentClassNameProp) {
  const display = useDisplay()
  const { ratio: deviceRatio } = getAspectRatio(
    display.dimensions.width,
    display.dimensions.height,
  )

  const timeTableStyles = useTimetableStyles()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)

  /* Initialize canvas */
  useEffect(() => {
    if (!canvasRef.current) return

    const initCanvas = new Canvas(canvasRef.current, {
      backgroundColor: '#ff0000',
      strokeWidth: 0,
    })
    const canvasWidth = initCanvas.getWidth()
    const canvasHeight = initCanvas.getHeight()

    const timetableBackground = new Rect({
      width: canvasWidth * 1 - timeTableStyles.margins.x,
      height: canvasHeight * 0.5 - timeTableStyles.margins.y,
      strokeWidth: 0,
      fill: '#00ff00',
      originX: 'left',
      originY: 'top',
    })

    const timetableGroup = new Group([timetableBackground], {
      selectable: false,
      evented: true,
      hoverCursor: 'pointer',
    })

    /* Reset position of timetable */
    timetableGroup.top = (canvasHeight - timetableGroup.height!) / 2

    timetableGroup.left = (canvasWidth - timetableGroup.width!) / 2
    timetableGroup.setCoords()
    // timetableGroup.top = canvasHeight - timetableGroup.height + 1
    // timetableGroup.left = 0
    // timetableGroup.setCoords()

    timetableGroup.on('mousedown', () => {
      console.log('Group clicked!')
    })

    initCanvas.add(timetableGroup)
    setCanvas(initCanvas)
    return () => {
      initCanvas.dispose()
    }
  }, [timeTableStyles])

  /* Resize logic */
  useEffect(() => {
    if (!canvas || !containerRef.current) return

    const handleContainerResize = () => {
      if (!canvas || !containerRef.current) return

      const container = containerRef.current
      const containerHeight = container.clientHeight

      /* Height-first sizing */
      const newHeight = containerHeight
      const newWidth = containerHeight * deviceRatio

      const oldWidth = canvas.getWidth()
      const oldHeight = canvas.getHeight()

      canvas.setWidth(newWidth)
      canvas.setHeight(newHeight)

      /* Rescale canvas contents */
      const scaleX = newWidth / oldWidth
      const scaleY = newHeight / oldHeight
      // const zoom = Math.min(scaleX, scaleY)
      // canvas.setZoom(zoom)
      canvas.getObjects().forEach((obj) => {
        obj.scaleX *= scaleX
        obj.scaleY *= scaleY
        obj.left *= scaleX
        obj.top *= scaleY
        obj.setCoords()
      })

      canvas.requestRenderAll()
    }

    /* Initial resize */
    handleContainerResize()
    window.addEventListener('resize', handleContainerResize)
    return () => {
      window.removeEventListener('resize', handleContainerResize)
    }
  }, [canvas, deviceRatio])

  return (
    <div
      ref={containerRef}
      className='absolute inset-4 grid place-items-center'
    >
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
