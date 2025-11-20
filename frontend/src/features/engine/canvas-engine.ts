import { Canvas, Rect } from 'fabric'

export class CanvasEngine {
  canvas: Canvas

  constructor(canvas: Canvas) {
    this.canvas = canvas
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
