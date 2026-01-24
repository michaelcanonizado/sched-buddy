import { Canvas, Group, Rect } from 'fabric'
import { useScheduleStore } from '../schedule/store/use-schedule-store'

export class CanvasEngine {
  canvas: Canvas
  unsubscribeDisplay: () => void

  constructor(canvas: Canvas) {
    const timetableBackground = new Rect({
      width: 100,
      height: 100,
      fill: 'green',
      left: 50,
      top: 50,
    })
    const timetableGroup = new Group([timetableBackground])
    canvas.add(timetableGroup)

    this.unsubscribeDisplay = useScheduleStore.subscribe((state, oldState) => {
      console.log('state: ', state, 'oldState: ', oldState)
    })

    this.canvas = canvas
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

  dispose() {
    this.unsubscribeDisplay()
    this.canvas.dispose()
  }
}
