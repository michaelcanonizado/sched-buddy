import { Canvas, FabricText, Group, Path, Rect, Textbox } from 'fabric'
import { ScheduleStoreState } from '../schedule/store/use-schedule-store'
import { Day, Time } from '../schedule/lib/mock-data'
import { Display } from '../display/lib/displays'

type GridBounds = {
  timeResolution: number
  startTime: number
  endTime: number
  days: Day[]
}

type GridLayout = {
  cellWidth: number
  cellHeight: number
  gridWidth: number
  gridHeight: number
  strokeWidth: number
}

export class CanvasEngine {
  private CANVAS: Canvas

  private VIRTUAL_TIMETABLE_WIDTH = 1100
  private VIRTUAL_TIMETABLE_HEIGHT = 800

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

  private timetableGroup: Group | null = null
  private cellGroup: Group | null = null
  private cellWidth = 0
  private cellHeight = 0

  constructor(canvas: HTMLCanvasElement) {
    this.CANVAS = new Canvas(canvas, {
      width: this.VIRTUAL_TIMETABLE_WIDTH,
      height: this.VIRTUAL_TIMETABLE_HEIGHT,
      backgroundColor: '#ff0000',
    })
  }

  resize(containerWidth: number, containerHeight: number) {
    /* Resize logic source: https://jsfiddle.net/robsch/g8x9mjvt/ */
    if (!this.CANVAS) return
    /* Determine whether to go with width-first or height-first scaling.
    Whichever prevents an overflow. */
    /* Try height-first scaling, and see if the width overflows the container */
    const tempScale = containerHeight / this.CANVAS.getHeight()
    const tempScaledWidth = this.CANVAS.getWidth() * tempScale
    /* If it doesn't overflow, stick with height-first scaling, else go with width-first. */
    if (tempScaledWidth < containerWidth) {
      /* Height-first scaling */
      const ratio = this.CANVAS.getHeight() / this.CANVAS.getWidth()
      const scale = containerHeight / this.CANVAS.getHeight()
      const zoom = this.CANVAS.getZoom() * scale
      this.CANVAS.setDimensions({
        width: containerHeight / ratio,
        height: containerHeight,
      })
      this.CANVAS.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    } else {
      /* Width-first scaling */
      const ratio = this.CANVAS.getWidth() / this.CANVAS.getHeight()
      const scale = containerWidth / this.CANVAS.getWidth()
      const zoom = this.CANVAS.getZoom() * scale
      this.CANVAS.setDimensions({
        width: containerWidth,
        height: containerWidth / ratio,
      })
      this.CANVAS.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    }
  }

  render(state: ScheduleStoreState) {
    this.CANVAS.clear()

    const gridBounds = this._computeGridBounds(state)
    this._setCanvasDimension(state.display)
    const gridLayout = this._drawTimetable(gridBounds)
    this._drawCells(state, gridBounds, gridLayout)

    this.timetableGroup!.scaleToWidth(
      this.CANVAS.getWidth() / this.CANVAS.getZoom(),
    )
    this.CANVAS.backgroundColor = '#ff0000'
    this.CANVAS.requestRenderAll()
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

  _drawCells(
    state: ScheduleStoreState,
    gridBounds: GridBounds,
    gridLayout: GridLayout,
  ) {
    if (!this.cellGroup) {
      console.warn('cellsContainer is NULL!')
      return
    }
    const cellGroup = this.cellGroup

    const cellsContainerBounding = this.cellGroup.getBoundingRect()
    /* Adjust the left and top values to include the strokes of the grid */
    const actualCellGroupLeft =
      cellsContainerBounding.left - gridLayout.strokeWidth / 2
    const actualCellGroupTop =
      cellsContainerBounding.top - gridLayout.strokeWidth / 2

    const cellPadding = 10

    state.subjects.forEach((subject) => {
      subject.meetings.forEach((meeting) => {
        const startTime = meeting.startTime
        const endTime = meeting.endTime

        meeting.days.forEach((day) => {
          const { width, height, left, top } = this._calculateSubjectLayout({
            startTime,
            endTime,
            day,
            gridBounds,
            gridLayout,
            cellGroup: {
              left: actualCellGroupLeft,
              top: actualCellGroupTop,
            },
          })

          const subjectBackground = new Rect({
            width,
            height,
            fill: subject.color,
            rx: 10,
            ry: 10,
            stroke: '#000000',
            strokeWidth: gridLayout.strokeWidth,
            originX: 'left',
            originY: 'top',
            left: 0,
            top: 0,
          })

          const subjectTitle = new Textbox(subject.title, {
            width: width - cellPadding * 2,
            left: cellPadding,
            top: height / 2,
            originX: 'left',
            originY: 'center',
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'Arial',
            backgroundColor: '#00ff0f',
          })

          const subjectGroup = new Group([subjectBackground, subjectTitle], {
            left,
            top,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
          })

          cellGroup.add(subjectGroup)
        })
      })
    })
  }

  _calculateSubjectLayout({
    startTime,
    endTime,
    day,
    gridBounds,
    gridLayout,
    cellGroup,
  }: {
    startTime: number
    endTime: number
    day: Day
    gridBounds: GridBounds
    gridLayout: GridLayout
    cellGroup: {
      left: number
      top: number
    }
  }): {
    width: number
    height: number
    left: number
    top: number
  } {
    const dayIndex = gridBounds.days.indexOf(day)
    if (dayIndex === -1) {
      throw new Error(
        'Unknown day found! Day of subject doesnt exist in gridBounds.days',
      )
    }

    const width = gridLayout.cellWidth
    const height =
      gridLayout.cellHeight *
      ((endTime - startTime) / gridBounds.timeResolution)
    const left = cellGroup.left + gridLayout.cellWidth * dayIndex
    const top =
      cellGroup.top +
      gridLayout.cellHeight *
        ((startTime - gridBounds.startTime) / gridBounds.timeResolution)

    return {
      width,
      height,
      left,
      top,
    }
  }

  _setCanvasDimension(display: Display | null) {
    if (!display) {
      this.CANVAS.setDimensions({
        width: this.VIRTUAL_TIMETABLE_WIDTH,
        height: this.VIRTUAL_TIMETABLE_HEIGHT,
      })
    } else {
      this.CANVAS.setDimensions({
        width: display.dimensions.width,
        height: display.dimensions.height,
      })
    }
  }

  _calculateNumberOfRows(start: Time, end: Time, resolution: number): number {
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

  _drawTimetable(bounds: GridBounds): GridLayout {
    const gridWidth = this.VIRTUAL_TIMETABLE_WIDTH
    const gridHeight = this.VIRTUAL_TIMETABLE_HEIGHT
    const gridOverlap = 10
    const gridStrokeWidth = 2
    const gridStrokeColor = '#000000'
    const timetableBackgroundColor = '#f2f2f2'
    const timetablePadding = 18
    const timeFormat = '12'
    const labelFont = 'Arial'
    const labelFontSize = 20
    const labelFontWeight = 500
    const rowLabelGap = 5
    const columnLabelGap = 0

    const startTime = bounds.startTime
    const endTime = bounds.endTime
    const timeResolution = bounds.timeResolution
    const days = bounds.days

    const numberOfDays = bounds.days.length
    const columnWidth = (gridWidth - 1) / numberOfDays

    const numberOfRows = this._calculateNumberOfRows(
      startTime,
      endTime,
      timeResolution,
    )
    const rowHeight = (gridHeight - 1) / numberOfRows

    /* Create temporary labels to get the dimensions of the labels. 
    This allows the timetable background to dynamically span the whole
    timetable without the labels overflowing on large font sizes */
    const tempRowLabel = new FabricText('99:99XX', {
      fontFamily: labelFont,
      fontSize: labelFontSize,
      fontWeight: labelFontWeight,
    })
    tempRowLabel.initDimensions()
    const rowLabelWidth = tempRowLabel.getScaledWidth()

    const tempColumnLabel = new FabricText('WEDNESDAY', {
      fontFamily: labelFont,
      fontSize: labelFontSize,
      fontWeight: labelFontWeight,
      lineHeight: 1,
    })
    tempColumnLabel.initDimensions()
    /* Calculate a rough estimate of the text height so the line-height is not taken */
    const columnLabelHeight = tempColumnLabel.fontSize * tempColumnLabel.scaleY

    /* Draw the column elements (days) */
    const columnElements = []
    for (let i = 0; i <= numberOfDays; i++) {
      const line = new Path(
        `M ${columnWidth * i} ${-gridOverlap} L ${columnWidth * i} ${gridHeight + gridOverlap}`,
        {
          stroke: gridStrokeColor,
          strokeWidth: gridStrokeWidth,
          selectable: false,
          evented: false,
        },
      )
      columnElements.push(line)

      if (i < numberOfDays) {
        const day =
          days[i].charAt(0).toUpperCase() + days[i].slice(1).toLowerCase()
        const label = new FabricText(day, {
          left: columnWidth * i + columnWidth / 2,
          top: -(gridOverlap + columnLabelGap),
          originY: 'bottom',
          fontFamily: labelFont,
          fontSize: labelFontSize,
          fontWeight: labelFontWeight,
          selectable: false,
          evented: false,
        })
        columnElements.push(label)
      }
    }
    const columnGroup = new Group(columnElements, {})

    /* Draw the row elements (time) */
    const rowElements = []
    let currentTimeLabel = startTime
    for (let i = 0; i <= numberOfRows; i++) {
      const line = new Path(
        `M ${-gridOverlap} ${rowHeight * i} L ${gridWidth + gridOverlap} ${rowHeight * i}`,
        {
          stroke: gridStrokeColor,
          strokeWidth: gridStrokeWidth,
          selectable: false,
          evented: false,
        },
      )
      rowElements.push(line)

      const label = new FabricText(
        this._timeGenerateLabel(currentTimeLabel, timeFormat),
        {
          left: -(gridOverlap + rowLabelGap),
          top: rowHeight * i,
          originX: 'right',
          fontFamily: labelFont,
          fontSize: labelFontSize,
          fontWeight: labelFontWeight,
          selectable: false,
          evented: false,
        },
      )
      rowElements.push(label)
      currentTimeLabel = this._timeIncrement(currentTimeLabel, timeResolution)
    }
    const rowGroup = new Group(rowElements, {})

    /* Determine the size of the tiemtable background such that it 
    encapsulates all elements without overflow */
    const leftSpacing = timetablePadding + rowLabelWidth + rowLabelGap
    const totalGridWidth = gridOverlap + gridWidth + gridOverlap
    const rightSpacing = timetablePadding

    const topSpacing = timetablePadding + columnLabelHeight + columnLabelGap
    const totalGridHeight = gridOverlap + gridHeight + gridOverlap
    const bottomSpacing = timetablePadding

    const timetableBackground = new Rect({
      width: leftSpacing + totalGridWidth + rightSpacing,
      height: topSpacing + totalGridHeight + bottomSpacing,
      fill: timetableBackgroundColor,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    /* Insert the group that will hold the subject cells, making it
    span the whole grid (excluding gridOverlap) */
    const cellsContainerBackground = new Rect({
      width: gridWidth,
      height: gridHeight,
      // fill: '#f2ff0f',
      fill: 'transparent',
    })
    const cellGroup = new Group([cellsContainerBackground], {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    const gridGroup = new Group([columnGroup, rowGroup, cellGroup], {
      left: timetableBackground.getScaledWidth() - timetablePadding,
      top: timetableBackground.getScaledHeight() - timetablePadding,
      originX: 'right',
      originY: 'bottom',
    })

    /* Temporarily center the timetable in the canvas */
    const zoom = this.CANVAS.getZoom()
    const vpt = this.CANVAS.viewportTransform
    const canvasCenterX = (this.CANVAS.getWidth() / 2 - vpt[4]) / zoom
    const canvasCenterY = (this.CANVAS.getHeight() / 2 - vpt[5]) / zoom

    const timetableGroup = new Group([timetableBackground, gridGroup], {
      originX: 'center',
      originY: 'center',
      left: canvasCenterX,
      top: canvasCenterY,
      // selectable: true,
      selectable: true,
      evented: true,
    })
    /* Temporarily make the timetable span the whole canvas width */

    this.CANVAS.add(timetableGroup)

    this.timetableGroup = timetableGroup
    this.cellGroup = cellGroup

    return {
      cellWidth: columnWidth,
      cellHeight: rowHeight,
      gridWidth: gridWidth,
      gridHeight: gridHeight,
      strokeWidth: gridStrokeWidth,
    }
  }

  export() {
    const dataUrl = this.CANVAS.toDataURL({
      format: 'png',
      quality: 3,
      multiplier: 3,
    })
    return dataUrl
  }

  dispose() {
    this.CANVAS.dispose()
  }
}
