import { Canvas, FabricText, Group, Path, Rect } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'
import { Time } from '../schedule/lib/mock-data'

export class CanvasEngine {
  private canvas: Canvas
  private gridStartTime: Time = 11 * 60 + 0
  private gridEndTime: Time = 17 * 60 + 0
  private timeResolution = 30
  private gridOverlap = 0
  private daysOfTheWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]

  private virtualWidth = 1100
  private virtualHeigth = 800

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {
      width: this.virtualWidth,
      height: this.virtualHeigth,
      backgroundColor: '#32a852',
    })
  }

  /* Width first scaling */
  resize(containerWidth: number) {
    if (!this.canvas) return

    const canvasAspectRatio = this.canvas.getWidth() / this.canvas.getHeight()
    const scale = containerWidth / this.canvas.getWidth()
    const zoom = this.canvas.getZoom() * scale
    this.canvas.setDimensions({
      width: containerWidth,
      height: containerWidth / canvasAspectRatio,
    })
    this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    this.canvas.renderAll()

    console.log(
      'Canvas width: ',
      this.canvas.getWidth(),
      ', Canvas zoom: ',
      this.canvas.getZoom(),
      ', Final canvasWidth: ',
      this.canvas.getWidth() * this.canvas.getZoom(),
    )
  }

  render(state: ScheduleStoreState) {
    this.canvas.clear()
    this._drawTimetableGrid()
    this.canvas.requestRenderAll()
  }

  calculateNumberOfHorizontalGridLines(
    start: Time,
    end: Time,
    resolution: number,
  ): number {
    return (end - start) / resolution
  }

  _timeIncrement(time: Time, incrementInMinutes: number): Time {
    return time + incrementInMinutes
  }

  _timeGenerateLabel(totalMinutes: number, format: '12' | '24'): string {
    if (totalMinutes < 0 || totalMinutes > 1439) {
      console.warn('Invalid time value: ', totalMinutes)
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    /* 24-hour format */
    if (format === '24') {
      return `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    /* 12-hour format */
    const isAM = hours < 12
    let hour12 = hours % 12
    if (hour12 === 0) hour12 = 12
    const minuteStr = minutes.toString().padStart(2, '0')
    const meridiem = isAM ? 'AM' : 'PM'

    return `${hour12}:${minuteStr}${meridiem}`
  }

  _drawTimetableGrid() {
    const gridWidth = this.canvas.getWidth() - 200
    const gridHeight = this.canvas.getHeight() - 200
    this.gridOverlap = 0.01 * this.canvas.getWidth()

    const numberOfDays = this.daysOfTheWeek.length
    /* Offset by 1 because somehow the last line doesnt show */
    const verticalLinesGap = (gridWidth - 1) / numberOfDays

    const numberOfHorizontalLines = this.calculateNumberOfHorizontalGridLines(
      this.gridStartTime,
      this.gridEndTime,
      this.timeResolution,
    )
    const horizontalLinesGap = (gridHeight - 1) / numberOfHorizontalLines

    /* Vertical lines */
    const verticalElements = []
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
      verticalElements.push(line)

      if (i < numberOfDays) {
        const label = new FabricText(this.daysOfTheWeek[i], {
          left: verticalLinesGap * i + verticalLinesGap / 2,
          top: -this.gridOverlap - 2,
          fontSize: 16,
          selectable: false,
          evented: false,
        })
        verticalElements.push(label)
      }
    }
    const verticalLinesGroup = new Group(verticalElements, {})

    /* Horisontal lines */
    const horizontalElements = []
    let currentTimeLabel = this.gridStartTime
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
      horizontalElements.push(line)

      const label = new FabricText(
        this._timeGenerateLabel(currentTimeLabel, '12'),
        {
          left: -(this.gridOverlap + 5),
          top: horizontalLinesGap * i,
          originX: 'right',
          fontSize: 16,
          selectable: false,
          evented: false,
        },
      )
      horizontalElements.push(label)
      currentTimeLabel = this._timeIncrement(
        currentTimeLabel,
        this.timeResolution,
      )
    }
    const horizontalLinesGroup = new Group(horizontalElements, {})

    const background = new Rect({
      width: gridWidth + 110,
      height: gridHeight + 60,
      fill: '#f2f2f2',
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    const gridLinesGroup = new Group(
      [verticalLinesGroup, horizontalLinesGroup],
      {
        left: background.getScaledWidth() - 10,
        top: background.getScaledHeight() - 10,
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
