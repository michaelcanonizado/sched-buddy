import { Canvas } from 'fabric'

export class CanvasEngine {
  canvas: Canvas

  constructor(canvas: Canvas) {
    this.canvas = canvas
  }

  dispose() {
    this.canvas.dispose()
  }
}
