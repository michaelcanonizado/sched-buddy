import { Canvas, Rect } from 'fabric'

export class CanvasEngine {
  canvas: Canvas

  constructor(canvas: Canvas) {
    this.canvas = canvas
  }

  setVariant(
    options:
      | { variant: 'with-display'; height: number; ratio: number }
      | { variant: 'without-display' },
  ) {
    const { variant } = options

    if (variant === 'with-display') {
      const { height, ratio } = options
      const displayHeight = height
      const displayWidth = height * ratio

      this.canvas.setDimensions({
        width: displayWidth,
        height: displayHeight,
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
    })

    this.canvas.add(rect)
    this.canvas.setActiveObject(rect)
    this.canvas.requestRenderAll()
  }
}
