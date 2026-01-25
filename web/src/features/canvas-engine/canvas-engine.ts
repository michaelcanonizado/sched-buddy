import { Canvas } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'

export class CanvasEngine {
  private canvas: Canvas

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {})
  }

  render(state: ScheduleStoreState) {
    console.log('Rerendering canvas with state: ', state)
  }

  dispose() {
    this.canvas.dispose()
  }
}
