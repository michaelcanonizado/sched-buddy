import { Canvas, Group, Rect, Text } from 'fabric'
import { useEffect, useRef, useState } from 'react'

export default function Timetable() {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState<Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const initCanvas = new Canvas(canvasRef.current, {
      backgroundColor: '#ff0000',
    })
    initCanvas.renderAll()

    const rect = new Rect({
      left: 50,
      top: 50,
      fill: 'tomato',
      width: 120,
      height: 80,
      hoverCursor: 'default',
    })

    const label = new Text('Hello!', {
      fontSize: 20,
      fill: 'white',
      top: -10,
    })

    const group = new Group([rect, label], {
      left: 50,
      top: 50,
      backgroundColor: '#00ff00',
      selectable: false,
      evented: true,
      hoverCursor: 'pointer',
    })

    group.on('mousedown', () => {
      console.log('Group clicked!')
    })

    initCanvas.add(group)
    setCanvas(initCanvas)
    return () => {
      initCanvas.dispose()
    }
  }, [])

  return <canvas className='' ref={canvasRef} />
}
