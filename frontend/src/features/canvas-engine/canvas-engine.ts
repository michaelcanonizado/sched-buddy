import { Canvas, Rect } from 'fabric'
import { useScheduleStore } from '../schedule/store/use-schedule-store'

export class CanvasEngine {
  canvas: Canvas

  constructor(canvas: Canvas) {
    this.canvas = canvas
  }

  setVariant(
    options:
      | { variant: 'with-display'; height: number; ratio: number }
      | { variant: 'without-display'; height: number },
  ) {
    const { variant, height } = options

    if (variant === 'with-display') {
      const { ratio } = options
      const displayHeight = height
      const displayWidth = height * ratio

      this.canvas.setDimensions({
        width: displayWidth,
        height: displayHeight,
      })
    }

    if (variant === 'without-display') {
      this.canvas.setDimensions({
        width: 700,
        height: height,
      })
    }
  }

  addRectangle() {
    const rect = new Rect({
      width: 150,
      height: 100,
      fill: 'lightgray',
      left: 100,
      top: 100,
      data: { id: 67 },
    })

    this.canvas.add(rect)
    this.canvas.setActiveObject(rect)
    this.canvas.requestRenderAll()

    useScheduleStore.getState().actions.addObject(rect)
  }
}
