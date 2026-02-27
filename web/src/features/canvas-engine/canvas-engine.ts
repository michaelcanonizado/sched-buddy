import { Canvas, FabricText, Group, Path, Rect } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'
import { Day, Time } from '../schedule/lib/mock-data'
import { Display } from '../display/lib/displays'

type GridBounds = {
  timeResolution: number
  startTime: number
  endTime: number
  days: Day[]
}

export class CanvasEngine {
  private canvas: Canvas

  private DEFAULT_TIME_RESOLUTION = 30
  private DEFAULT_START_TIME = 8 * 60
  private DEFAULT_END_TIME = 17 * 60
  private DEFAULT_DAYS: Day[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ]

  private cellsGroup: Group | null = null
  private timetableGroup: Group | null = null
  private cellWidth = 0
  private cellHeight = 0

  private VIRTUAL_TIMETABLE_WIDTH = 1100
  private VIRTUAL_TIMETABLE_HEIGHT = 800

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {
      width: this.VIRTUAL_TIMETABLE_WIDTH,
      height: this.VIRTUAL_TIMETABLE_HEIGHT,
      backgroundColor: '#ff0000',
    })
  }

  resize(containerWidth: number, containerHeight: number) {
    /* Resize logic source: https://jsfiddle.net/robsch/g8x9mjvt/ */
    if (!this.canvas) return
    /* Determine whether to go with width-first or height-first scaling.
    Whichever prevents an overflow. */
    /* Try height-first scaling, and see if the width overflows the container */
    const tempScale = containerHeight / this.canvas.getHeight()
    const tempScaledWidth = this.canvas.getWidth() * tempScale
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

    const bounds = this._computeGridBounds(state)
    console.log('Bounds: ', bounds)

    this._setCanvasDimension(state.display)
    this._drawTimetableGrid(bounds)
    this._drawCells()

    this.timetableGroup!.scaleToWidth(
      this.canvas.getWidth() / this.canvas.getZoom(),
    )
    this.canvas.backgroundColor = '#ff0000'
    this.canvas.requestRenderAll()
  }

  _computeGridBounds(state: ScheduleStoreState): GridBounds {
    if (state.subjects.length === 0) {
      return {
        timeResolution: this.DEFAULT_TIME_RESOLUTION,
        startTime: this.DEFAULT_START_TIME,
        endTime: this.DEFAULT_END_TIME,
        days: this.DEFAULT_DAYS,
      }
    }

    const minTime = Math.min(
      this.DEFAULT_START_TIME,
      ...state.subjects.flatMap((s) => s.meetings.map((m) => m.startTime)),
    )

    const maxTime = Math.max(
      this.DEFAULT_END_TIME,
      ...state.subjects.flatMap((s) => s.meetings.map((m) => m.endTime)),
    )

    const WEEK_DAYS: Day[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]

    let minIndex = Infinity
    let maxIndex = -Infinity

    for (const subject of state.subjects) {
      for (const meeting of subject.meetings) {
        for (const day of meeting.days) {
          const index = WEEK_DAYS.indexOf(day)
          if (index !== -1) {
            minIndex = Math.min(minIndex, index)
            maxIndex = Math.max(maxIndex, index)
          }
        }
      }
    }

    const subjectDays =
      minIndex <= maxIndex ? WEEK_DAYS.slice(minIndex, maxIndex + 1) : []

    const days = Array.from(new Set([...this.DEFAULT_DAYS, ...subjectDays]))

    return {
      timeResolution: this.DEFAULT_TIME_RESOLUTION,
      startTime: minTime,
      endTime: maxTime,
      days,
    }
  }

  _drawCells() {
    if (!this.cellsGroup) {
      console.warn('cellsContainer is NULL!')
      return
    }

    const cellsContainerBounding = this.cellsGroup.getBoundingRect()

    const rect = new Rect({
      width: this.cellWidth,
      height: this.cellHeight,
      fill: '#00ff00',
      originX: 'left',
      originY: 'top',
      left: cellsContainerBounding.left,
      top: cellsContainerBounding.top,
    })

    this.cellsGroup.add(rect)
  }

  _setCanvasDimension(display: Display | null) {
    if (!display) {
      this.canvas.setDimensions({
        width: this.VIRTUAL_TIMETABLE_WIDTH,
        height: this.VIRTUAL_TIMETABLE_HEIGHT,
      })
    } else {
      this.canvas.setDimensions({
        width: display.dimensions.width,
        height: display.dimensions.height,
      })
    }
  }

  _calculateNumberOfYAxisGridLines(
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

  _drawTimetableGrid(bounds: GridBounds) {
    const gridWidth = this.VIRTUAL_TIMETABLE_WIDTH
    const gridHeight = this.VIRTUAL_TIMETABLE_HEIGHT
    const gridOverlap = 0.01 * this.canvas.getWidth()
    const gridStrokeWidth = 2
    const gridStrokeColor = '#000000'
    const timetableBackgroundColor = '#f2f2f2'
    const labelFontSize = 16

    const startTime = bounds.startTime
    const endTime = bounds.endTime
    const timeResolution = bounds.timeResolution
    const days = bounds.days

    const numberOfDays = bounds.days.length
    const xAxisLinesGap = (gridWidth - 1) / numberOfDays

    const numberOfYAxisLines = this._calculateNumberOfYAxisGridLines(
      startTime,
      endTime,
      timeResolution,
    )
    const yAxisLinesGap = (gridHeight - 1) / numberOfYAxisLines

    /* X Axis lines (days) */
    const xAxisElements = []
    for (let i = 0; i <= numberOfDays; i++) {
      const line = new Path(
        `M ${xAxisLinesGap * i} ${-gridOverlap} L ${xAxisLinesGap * i} ${gridHeight + gridOverlap}`,
        {
          stroke: gridStrokeColor,
          strokeWidth: gridStrokeWidth,
          selectable: false,
          evented: false,
        },
      )
      xAxisElements.push(line)

      if (i < numberOfDays) {
        const day =
          days[i].charAt(0).toUpperCase() + days[i].slice(1).toLowerCase()
        const label = new FabricText(day, {
          left: xAxisLinesGap * i + xAxisLinesGap / 2,
          top: -gridOverlap - 2,
          fontSize: labelFontSize,
          selectable: false,
          evented: false,
        })
        xAxisElements.push(label)
      }
    }
    const xAxisLinesGroup = new Group(xAxisElements, {})

    /* Y Axis lines (time) */
    const yAxisElements = []
    let currentTimeLabel = startTime
    for (let i = 0; i <= numberOfYAxisLines; i++) {
      const line = new Path(
        `M ${-gridOverlap} ${yAxisLinesGap * i} L ${gridWidth + gridOverlap} ${yAxisLinesGap * i}`,
        {
          stroke: gridStrokeColor,
          strokeWidth: gridStrokeWidth,
          selectable: false,
          evented: false,
        },
      )
      yAxisElements.push(line)

      const label = new FabricText(
        this._timeGenerateLabel(currentTimeLabel, '12'),
        {
          left: -(gridOverlap + 5),
          top: yAxisLinesGap * i,
          originX: 'right',
          fontSize: labelFontSize,
          selectable: false,
          evented: false,
        },
      )
      yAxisElements.push(label)
      currentTimeLabel = this._timeIncrement(currentTimeLabel, timeResolution)
    }
    const yAxisLinesGroup = new Group(yAxisElements, {})

    const background = new Rect({
      width: gridWidth + 110,
      height: gridHeight + 60,
      fill: timetableBackgroundColor,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    const cellsContainerBackground = new Rect({
      width: gridWidth,
      height: gridHeight,
      fill: 'transparent',
    })

    const cellsContainer = new Group([cellsContainerBackground], {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })
    this.cellsGroup = cellsContainer

    const gridLinesGroup = new Group(
      [xAxisLinesGroup, yAxisLinesGroup, cellsContainer],
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
      selectable: true,
    })

    this.canvas.add(timetableGroup)
    this.timetableGroup = timetableGroup

    this.cellWidth = xAxisLinesGap - gridStrokeWidth
    this.cellHeight = yAxisLinesGap - gridStrokeWidth
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
