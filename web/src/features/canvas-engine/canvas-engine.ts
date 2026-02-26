import { Canvas, FabricText, Group, Path, Rect } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'
import { Time } from '../schedule/lib/mock-data'
import { Display } from '../display/lib/displays'

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

  private VIRTUAL_TIMETABLE_WIDTH = 1100
  private VIRTUAL_TIMETABLE_HEIGHT = 800

  private virtualCanvasWidth = this.VIRTUAL_TIMETABLE_WIDTH
  private virtualCanvasHeight = this.VIRTUAL_TIMETABLE_HEIGHT

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {
      width: this.virtualCanvasWidth,
      height: this.virtualCanvasHeight,
      backgroundColor: '#ff0000',
    })
  }

  resize(containerWidth: number, containerHeight: number) {
    /* Resize logic source: https://jsfiddle.net/robsch/g8x9mjvt/ */
    if (!this.canvas) return
    /* Determine whether to go with width-first or height-first scaling.
    Whichever prevents an overflow. */
    /* Try height-first scaling, and see if the width overflows the container */
    const tempScale = containerHeight / this.virtualCanvasHeight
    const tempScaledWidth = this.virtualCanvasWidth * tempScale
    /* If it doesn't overflow, stick with height-first scaling, else go with width-first. */
    if (tempScaledWidth < containerWidth) {
      /* Height-first scaling */
      const ratio = this.canvas.getHeight() / this.canvas.getWidth()
      const scale = containerHeight / this.canvas.getHeight()
      const zoom = this.canvas.getZoom() * scale
      this.canvas.setDimensions({
        width: containerHeight / ratio,
        height: containerHeight,
      })
      this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    } else {
      /* Width-first scaling */
      const ratio = this.canvas.getWidth() / this.canvas.getHeight()
      const scale = containerWidth / this.canvas.getWidth()
      const zoom = this.canvas.getZoom() * scale
      this.canvas.setDimensions({
        width: containerWidth,
        height: containerWidth / ratio,
      })
      this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    }
  }

  render(state: ScheduleStoreState) {
    this.canvas.clear()
    this._setCanvasDimension(state.display)
    this._drawTimetableGrid()
    this.canvas.backgroundColor = '#ff0000'
    this.canvas.requestRenderAll()
  }

  _drawTimetableGrid_() {
    console.log('Adding rect')

    const rect = new Rect({
      originX: 'center',
      originY: 'center',
      left: 0,
      top: 0,
      width: 500,
      height: 500,
      fill: '#00ff00',
    })

    const text = new FabricText('Hello World!', {
      left: 0,
      top: 0,
      originX: 'center',
      originY: 'center',
      fontSize: 32,
      selectable: false,
      evented: false,
    })

    const group = new Group([rect, text])

    this.canvas.add(group)
    this.canvas.centerObject(group)
  }

  _setCanvasDimension(display: Display | null) {
    /* Two types of canvas size:
    1) Logical
    2) Viewport
    
    Logical/virtual size is the base canvas size. Responsiveness
    is done by scaling the canvas (viewport size). */

    /* Determine the virtual dimensions */
    if (!display) {
      this.virtualCanvasWidth = this.VIRTUAL_TIMETABLE_WIDTH
      this.virtualCanvasHeight = this.VIRTUAL_TIMETABLE_HEIGHT
      return
    } else {
      this.virtualCanvasWidth = display.dimensions.width
      this.virtualCanvasHeight = display.dimensions.height
    }

    /* Set canvas dimensions */
    this.canvas.setDimensions({
      width: this.virtualCanvasWidth,
      height: this.virtualCanvasHeight,
    })
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
    const gridWidth = this.VIRTUAL_TIMETABLE_WIDTH
    const gridHeight = this.VIRTUAL_TIMETABLE_HEIGHT
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

    const zoom = this.canvas.getZoom()
    const vpt = this.canvas.viewportTransform
    const canvasCenterX = (this.canvas.getWidth() / 2 - vpt[4]) / zoom
    const canvasCenterY = (this.canvas.getHeight() / 2 - vpt[5]) / zoom

    const timetableGroup = new Group([background, gridLinesGroup], {
      originX: 'center',
      originY: 'center',
      left: canvasCenterX,
      top: canvasCenterY,
    })

    this.canvas.add(timetableGroup)
    timetableGroup.scaleToWidth(this.canvas.getWidth() / this.canvas.getZoom())
    timetableGroup.setCoords()
  }

  export() {
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      quality: 3,
      multiplier: 3,
    })
    return dataUrl
  }

  dispose() {
    this.canvas.dispose()
  }
}
