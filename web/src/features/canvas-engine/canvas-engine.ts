import { Canvas, Group, Path, Rect } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'
import { Time } from '../schedule/lib/mock-data'

export class CanvasEngine {
  private canvas: Canvas
  private gridStartTime: Time = {
    hours: 11,
    minutes: 0,
  }
  private gridEndTime: Time = {
    hours: 17,
    minutes: 0,
  }
  private timeResolution = 30
  private gridOverlap = 10

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {
      width: 1100,
      height: 700,
    })
  }

  render(state: ScheduleStoreState) {
    console.log('Rerendering canvas with state: ', state)
    this.canvas.clear()
    this.drawTimetableGrid()
    this.canvas.requestRenderAll()
  }

  calculateNumberOfHorizontalGridLines(
    start: Time,
    end: Time,
    resolution: number,
  ): number {
    const minutesSpan =
      end.hours * 60 + end.minutes - (start.hours * 60 + start.minutes)
    console.log('Minute Span: ', minutesSpan, ' | ', minutesSpan / resolution)
    return minutesSpan / resolution
  }

  drawTimetableGrid() {
    const gridWidth = this.canvas.getWidth() - 200
    const gridHeight = this.canvas.getHeight() - 200

    const numberOfDays = 5
    /* Offset by 1 because somehow the last line doesnt show */
    const verticalLinesGap = (gridWidth - 1) / numberOfDays

    const numberOfHorizontalLines = this.calculateNumberOfHorizontalGridLines(
      this.gridStartTime,
      this.gridEndTime,
      this.timeResolution,
    )
    const horizontalLinesGap = (gridHeight - 1) / numberOfHorizontalLines

    /* Vertical lines */
    const verticalLines = []
    for (let i = 0; i <= numberOfDays; i++) {
      const line = new Path(
        `M ${verticalLinesGap * i} ${-this.gridOverlap} L ${verticalLinesGap * i} ${gridHeight + this.gridOverlap}`,
        {
          stroke: '#000000',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        },
      )
      verticalLines.push(line)
    }
    const verticalLinesGroup = new Group(verticalLines, {})

    /* Horisontal lines */
    const horizontalLines = []
    for (let i = 0; i <= numberOfHorizontalLines; i++) {
      const line = new Path(
        `M ${-this.gridOverlap} ${horizontalLinesGap * i} L ${gridWidth + this.gridOverlap} ${horizontalLinesGap * i}`,
        {
          stroke: '#000000',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        },
      )
      horizontalLines.push(line)
    }
    const horizontalLinesGroup = new Group(horizontalLines, {})

    const background = new Rect({
      width: gridWidth + 100,
      height: gridHeight + 100,
      fill: '#f2f2f2',
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    const gridLinesGroup = new Group(
      [verticalLinesGroup, horizontalLinesGroup],
      {
        left: background.getScaledWidth(),
        top: background.getScaledHeight(),
        originX: 'right',
        originY: 'bottom',
      },
    )

    const timetableGroup = new Group([background, gridLinesGroup], {
      selectable: false,
      left: this.canvas.getWidth() / 2,
      top: this.canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
    })
    this.canvas.add(timetableGroup)
  }

  dispose() {
    this.canvas.dispose()
  }
}
