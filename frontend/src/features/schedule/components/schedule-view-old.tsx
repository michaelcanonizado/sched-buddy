'use client'

import { cn } from '@/lib/utils'
import { Canvas } from 'fabric'
import { useEffect, useRef } from 'react'
import { CanvasEngine } from '@/features/canvas-engine/canvas-engine'
import { Button } from '@/components/ui/button'
import {
  useCanvasEngine,
  useCanvasEngineActions,
} from '@/features/canvas-engine/store/use-canvas-engine-store'

export default function ScheduleView() {
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
      canvasEngine?.dispose()
      setCanvasEngine(null)
    }
  }, [setCanvasEngine])

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
      <div className={cn('size-fit overflow-hidden rounded-xl')}>
        <canvas className='m-0 block p-0' ref={canvasRef} />
      </div>
    </div>
  )
}
