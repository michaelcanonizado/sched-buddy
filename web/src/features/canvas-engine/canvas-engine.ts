import { TimeResolution } from './../schedule/store/use-schedule-store'
import {
  Canvas,
  FabricText,
  Group,
  Path,
  Rect,
  Textbox,
  TextboxProps,
  TOptions,
} from 'fabric'
import {
  ScheduleStoreState,
  Settings,
  TimeFormat,
} from '../schedule/store/use-schedule-store'
import { Day, Time } from '../schedule/lib/mock-data'
import { Display } from '../display/lib/displays'

type TimetableStyle = {
  grid: {
    overlap: number
    strokeColor: string
    strokeWidth: number
    font: string
    fontSize: number
    fontWeight: number
    rowLabelGap: number
    columnLabelGap: number
    cell: {
      gap: number
      lineHeight: number
      heading: {
        fontSize: number
        fontWeight: number
      }
      subheading: {
        fontSize: number
        fontWeight: number
      }
      body: {
        fontSize: number
        fontWeight: number
      }
    }
  }
  backgroundColor: string
  margin: 18
}

type GridBounds = {
  gridWidth: number
  gridHeight: number
  timeResolution: number
  timeFormat: TimeFormat
  startTime: number
  endTime: number
  days: Day[]
  cellWidth: number
  cellHeight: number
}

export class CanvasEngine {
  private CANVAS: Canvas

  private DEFAULT_GRID_WIDTH = 1100
  private DEFAULT_GRID_HEIGHT = 800

  private DEFAULT_START_TIME = 8 * 60
  private DEFAULT_END_TIME = 17 * 60

  private timetableGroup: Group | null = null
  private cellGroup: Group | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.CANVAS = new Canvas(canvas, {
      width: this.DEFAULT_GRID_WIDTH,
      height: this.DEFAULT_GRID_HEIGHT,
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

    const defaultTimetableStyle: TimetableStyle = {
      grid: {
        overlap: 10,
        strokeWidth: 2,
        strokeColor: '#000000',
        font: 'Arial',
        fontSize: 20,
        fontWeight: 700,
        rowLabelGap: 5,
        columnLabelGap: 0,
        cell: {
          gap: 12,
          lineHeight: 0.8,
          heading: {
            fontSize: 18,
            fontWeight: 600,
          },
          subheading: {
            fontSize: 14,
            fontWeight: 600,
          },
          body: {
            fontSize: 12,
            fontWeight: 500,
          },
        },
      },
      backgroundColor: '#f2f2f2',
      margin: 18,
    }
    const gridBounds = this._computeGridBounds(state, defaultTimetableStyle)

    this._setCanvasDimension(state.display)
    this._drawTimetable(defaultTimetableStyle, gridBounds)
    this._drawCells(state, defaultTimetableStyle, gridBounds)

    this.timetableGroup!.scaleToWidth(
      this.CANVAS.getWidth() / this.CANVAS.getZoom(),
    )
    this.CANVAS.backgroundColor = '#ff0000'
    this.CANVAS.requestRenderAll()
  }

  _getTimetableDays(
    subjects: ScheduleStoreState['subjects'],
    startOfWeek: Settings['startOfWeek'],
    showWeekends: Settings['showWeekend'],
  ): Day[] {
    const DAYS: Day[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]

    /* Rotate the week so it starts at the set startOfWeek */
    const startIndex = DAYS.indexOf(startOfWeek)
    const rotatedWeek = [
      ...DAYS.slice(startIndex),
      ...DAYS.slice(0, startIndex),
    ]

    if (showWeekends) return rotatedWeek

    /* Determine the weekends based on startOfWeek */
    const weekends: Day[] = []
    if (startOfWeek === 'monday') {
      weekends.push('saturday')
      weekends.push('sunday')
    }
    if (startOfWeek === 'sunday') {
      weekends.push('friday')
      weekends.push('saturday')
    }

    const uniqueSubjectDays = new Set<Day>()
    for (const subject of subjects) {
      for (const meeting of subject.meetings) {
        for (const day of meeting.days) {
          uniqueSubjectDays.add(day)
        }
      }
    }

    /* In the case where user has the setting: showWeekend=false, but has a subject on a weekend, show the weekend regardless. */
    const hasSubjectOnAWeekend = weekends.some((day) =>
      uniqueSubjectDays.has(day),
    )
    if (hasSubjectOnAWeekend) return rotatedWeek

    return rotatedWeek.filter((day) => !weekends.includes(day))
  }

  _getTimetableStartAndEndTime(state: ScheduleStoreState) {
    const minTime = Math.min(
      this.DEFAULT_START_TIME,
      ...state.subjects.flatMap((s) => s.meetings.map((m) => m.startTime)),
    )

    const maxTime = Math.max(
      this.DEFAULT_END_TIME,
      ...state.subjects.flatMap((s) => s.meetings.map((m) => m.endTime)),
    )

    return {
      startTime: minTime,
      endTime: maxTime,
    }
  }

  _getTimetableGridHeight(
    subjects: ScheduleStoreState['subjects'],
    style: TimetableStyle,
    cellWidth: number,
    startTime: number,
    endTime: number,
    timeResolution: TimeResolution,
  ) {
    const baseCellContentStyles: TOptions<TextboxProps> = {
      width: cellWidth - style.grid.cell.gap * 2,
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
      left: 0,
      backgroundColor: '#00ff00',
      lineHeight: style.grid.cell.lineHeight,
      fontFamily: style.grid.font,
      fontSize: style.grid.fontSize,
      fontWeight: style.grid.fontWeight,
    }

    const numberOfGridRows = this._calculateNumberOfRows(
      startTime,
      endTime,
      timeResolution,
    )

    const subjectMeetingWithMaxContentHeight = {
      contentHeight: 0,
      subjectHeight: 0,
      startTime: 0,
      endTime: 0,
    }

    subjects.forEach((subject) => {
      subject.meetings.forEach((meeting) => {
        let topOffset = 0
        const subjectTitle = new Textbox(subject.title, {
          ...baseCellContentStyles,
          fontSize: style.grid.cell.heading.fontSize,
          fontWeight: style.grid.cell.heading.fontWeight,
          top: topOffset,
        })

        subjectTitle.initDimensions()
        topOffset += subjectTitle.getScaledHeight() + style.grid.cell.gap
        const subjectInstructor = new Textbox(meeting.instructor, {
          ...baseCellContentStyles,
          fontSize: style.grid.cell.subheading.fontSize,
          fontWeight: style.grid.cell.subheading.fontWeight,
          top: topOffset,
        })

        subjectInstructor.initDimensions()
        topOffset += subjectInstructor.getScaledHeight() + style.grid.cell.gap
        const subjectTime = new Textbox(
          `${this._timeGenerateLabel(meeting.startTime, '12')}-${this._timeGenerateLabel(meeting.endTime, '12')}`,
          {
            ...baseCellContentStyles,
            fontSize: style.grid.cell.body.fontSize,
            fontWeight: style.grid.cell.body.fontWeight,
            top: topOffset,
          },
        )

        subjectTime.initDimensions()
        topOffset += subjectTime.getScaledHeight() + style.grid.cell.gap
        const subjectLocation = new Textbox(meeting.location, {
          ...baseCellContentStyles,
          fontSize: style.grid.cell.body.fontSize,
          fontWeight: style.grid.cell.body.fontWeight,
          top: topOffset,
        })

        const subjectContent = new Group(
          [subjectTitle, subjectInstructor, subjectTime, subjectLocation],
          {
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            fill: '#4287f5',
          },
        )

        const subjectContentHeight = subjectContent.getScaledHeight()
        /* Find the subject with the most content */
        if (
          subjectContentHeight >
          subjectMeetingWithMaxContentHeight.contentHeight
        ) {
          /* Get the subject height  */
          const cellHeight = (this.DEFAULT_GRID_HEIGHT - 1) / numberOfGridRows
          const subjectHeight =
            cellHeight *
            ((meeting.endTime - meeting.startTime) / timeResolution)

          subjectMeetingWithMaxContentHeight.contentHeight =
            subjectContentHeight
          subjectMeetingWithMaxContentHeight.subjectHeight = subjectHeight
          subjectMeetingWithMaxContentHeight.startTime = meeting.startTime
          subjectMeetingWithMaxContentHeight.endTime = meeting.endTime
        }
      })
    })

    console.log(subjectMeetingWithMaxContentHeight)

    /* If the subject with the most content doesn't overflow its
    subject height, dont adjust the grid height */
    if (
      subjectMeetingWithMaxContentHeight.contentHeight <
      subjectMeetingWithMaxContentHeight.subjectHeight
    ) {
      return this.DEFAULT_GRID_HEIGHT
    }

    const actualSubjectHeight =
      subjectMeetingWithMaxContentHeight.contentHeight + style.grid.cell.gap * 2
    const newCellHeight =
      actualSubjectHeight /
      ((subjectMeetingWithMaxContentHeight.endTime -
        subjectMeetingWithMaxContentHeight.startTime) /
        timeResolution)

    const newGridHeight = newCellHeight * numberOfGridRows + 1

    console.log(`nch: ${newCellHeight}, ngh: ${newGridHeight}`)

    // cellHeight * numberOfRows + 1 = this.DEFAULT_GRID_HEIGHT

    return newGridHeight
    // return this.DEFAULT_GRID_HEIGHT
  }

  _computeGridBounds(
    state: ScheduleStoreState,
    style: TimetableStyle,
  ): GridBounds {
    if (!state.settings) {
      throw new Error('state.settings is NULL!')
    }

    const timetableDays = this._getTimetableDays(
      state.subjects,
      state.settings.startOfWeek,
      state.settings.showWeekend,
    )

    if (state.subjects.length === 0) {
      return {
        gridWidth: this.DEFAULT_GRID_WIDTH,
        gridHeight: this.DEFAULT_GRID_HEIGHT,
        timeResolution: state.settings.timeResolution,
        timeFormat: state.settings.timeFormat,
        startTime: this.DEFAULT_START_TIME,
        endTime: this.DEFAULT_END_TIME,
        days: timetableDays,
        cellWidth: (this.DEFAULT_GRID_WIDTH - 1) / timetableDays.length,
        cellHeight: this._calculateNumberOfRows(
          this.DEFAULT_START_TIME,
          this.DEFAULT_END_TIME,
          state.settings.timeResolution,
        ),
      }
    }

    /* Determine the start and end times of the timetable */
    const { startTime, endTime } = this._getTimetableStartAndEndTime(state)

    const gridWidth = this.DEFAULT_GRID_WIDTH
    const cellWidth = (gridWidth - 1) / timetableDays.length

    const gridHeight = this._getTimetableGridHeight(
      state.subjects,
      style,
      cellWidth,
      startTime,
      endTime,
      state.settings.timeResolution,
    )

    const numberOfRows = this._calculateNumberOfRows(
      startTime,
      endTime,
      state.settings.timeResolution,
    )
    const cellHeight = (gridHeight - 1) / numberOfRows

    return {
      gridWidth,
      gridHeight,
      timeResolution: state.settings.timeResolution,
      startTime,
      endTime,
      days: timetableDays,
      timeFormat: state.settings.timeFormat,
      cellWidth,
      cellHeight,
    }
  }

  _drawCells(
    state: ScheduleStoreState,
    style: TimetableStyle,
    gridBounds: GridBounds,
  ) {
    if (!this.cellGroup) {
      console.warn('cellsContainer is NULL!')
      return
    }
    const cellGroup = this.cellGroup

    const cellsContainerBounding = this.cellGroup.getBoundingRect()
    /* Adjust the left and top values to include the strokes of the grid */
    const actualCellGroupLeft =
      cellsContainerBounding.left - style.grid.strokeWidth / 2
    const actualCellGroupTop =
      cellsContainerBounding.top - style.grid.strokeWidth / 2

    const baseCellContentStyles: TOptions<TextboxProps> = {
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
      left: 0,
      lineHeight: style.grid.cell.lineHeight,
      fontFamily: style.grid.font,
    }

    state.subjects.forEach((subject) => {
      subject.meetings.forEach((meeting) => {
        const startTime = meeting.startTime
        const endTime = meeting.endTime

        meeting.days.forEach((day) => {
          const { width, height, left, top, contentWidth } =
            this._calculateSubjectLayout({
              startTime,
              endTime,
              day,
              gridBounds,
              cellGroup: {
                left: actualCellGroupLeft,
                top: actualCellGroupTop,
              },
              style,
            })

          let topOffset = 0
          const subjectTitle = new Textbox(subject.title, {
            ...baseCellContentStyles,
            width: contentWidth,
            fontSize: style.grid.cell.heading.fontSize,
            fontWeight: style.grid.cell.heading.fontWeight,
            top: topOffset,
          })

          subjectTitle.initDimensions()
          topOffset += subjectTitle.getScaledHeight() + style.grid.cell.gap
          const subjectInstructor = new Textbox(meeting.instructor, {
            ...baseCellContentStyles,
            width: contentWidth,
            fontSize: style.grid.cell.subheading.fontSize,
            fontWeight: style.grid.cell.subheading.fontWeight,
            top: topOffset,
          })

          subjectInstructor.initDimensions()
          topOffset += subjectInstructor.getScaledHeight() + style.grid.cell.gap
          const subjectTime = new Textbox(
            `${this._timeGenerateLabel(meeting.startTime, '12')}-${this._timeGenerateLabel(meeting.endTime, '12')}`,
            {
              ...baseCellContentStyles,
              width: contentWidth,
              fontSize: style.grid.cell.body.fontSize,
              fontWeight: style.grid.cell.body.fontWeight,
              top: topOffset,
            },
          )

          subjectTime.initDimensions()
          topOffset += subjectTime.getScaledHeight() + style.grid.cell.gap
          const subjectLocation = new Textbox(meeting.location, {
            ...baseCellContentStyles,
            width: contentWidth,
            fontSize: style.grid.cell.body.fontSize,
            fontWeight: style.grid.cell.body.fontWeight,
            top: topOffset,
          })

          topOffset += subjectLocation.getScaledHeight()

          const subjectContent = new Group(
            [subjectTitle, subjectInstructor, subjectTime, subjectLocation],
            {
              left: style.grid.cell.gap,
              fill: '#4287f5',
              top: height / 2 - topOffset / 2,
              originX: 'left',
              originY: 'top',
              selectable: false,
              evented: false,
            },
          )

          if (meeting.id === '3') {
            console.log('_drawCells(): ', subjectContent.getScaledHeight())
            console.log(`l: ${left}, t: ${top}`)
          }

          const subjectBackground = new Rect({
            width,
            height,
            fill: subject.color,
            rx: 10,
            ry: 10,
            stroke: '#000000',
            strokeWidth: style.grid.strokeWidth,
            originX: 'left',
            originY: 'top',
            left: 0,
            top: 0,
          })

          const subjectGroup = new Group([subjectBackground, subjectContent], {
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
    cellGroup,
    style,
  }: {
    startTime: number
    endTime: number
    day: Day
    gridBounds: GridBounds
    cellGroup: {
      left: number
      top: number
    }
    style: TimetableStyle
  }): {
    width: number
    height: number
    left: number
    top: number
    contentWidth: number
  } {
    const dayIndex = gridBounds.days.indexOf(day)
    if (dayIndex === -1) {
      throw new Error(
        'Unknown day found! Day of subject doesnt exist in gridBounds.days',
      )
    }

    const width = gridBounds.cellWidth
    const height =
      gridBounds.cellHeight *
      ((endTime - startTime) / gridBounds.timeResolution)
    const left = cellGroup.left + gridBounds.cellWidth * dayIndex
    const top =
      cellGroup.top +
      gridBounds.cellHeight *
        ((startTime - gridBounds.startTime) / gridBounds.timeResolution)
    const contentWidth = width - style.grid.cell.gap * 2

    return {
      width,
      height,
      left,
      top,
      contentWidth,
    }
  }

  _setCanvasDimension(display: Display | null) {
    if (!display) {
      this.CANVAS.setDimensions({
        width: this.DEFAULT_GRID_WIDTH,
        height: this.DEFAULT_GRID_HEIGHT,
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

  _timeGenerateLabel(totalMinutes: number, format: TimeFormat): string {
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

  _drawTimetable(style: TimetableStyle, bounds: GridBounds) {
    const {
      backgroundColor,
      margin,
      grid: {
        overlap: gridOverlap,
        strokeColor: gridStrokeColor,
        strokeWidth: gridStrokeWidth,
        font: gridFont,
        fontSize: gridFontSize,
        fontWeight: gridFontWeight,
        rowLabelGap: gridRowLabelGap,
        columnLabelGap: gridColumnLabelGap,
      },
    } = style

    const {
      gridWidth,
      gridHeight,
      startTime,
      endTime,
      timeResolution,
      timeFormat,
      days,
    } = bounds

    const numberOfDays = days.length
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
      fontFamily: gridFont,
      fontSize: gridFontSize,
      fontWeight: gridFontWeight,
    })
    tempRowLabel.initDimensions()
    const rowLabelWidth = tempRowLabel.getScaledWidth()

    const tempColumnLabel = new FabricText('WEDNESDAY', {
      fontFamily: gridFont,
      fontSize: gridFontSize,
      fontWeight: gridFontWeight,
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
          top: -(gridOverlap + gridColumnLabelGap),
          originY: 'bottom',
          fontFamily: gridFont,
          fontSize: gridFontSize,
          fontWeight: gridFontWeight,
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
          left: -(gridOverlap + gridRowLabelGap),
          top: rowHeight * i,
          originX: 'right',
          fontFamily: gridFont,
          fontSize: gridFontSize,
          fontWeight: gridFontWeight,
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
    const leftSpacing = margin + rowLabelWidth + gridRowLabelGap
    const totalGridWidth = gridOverlap + gridWidth + gridOverlap
    const rightSpacing = margin

    const topSpacing = margin + columnLabelHeight + gridColumnLabelGap
    const totalGridHeight = gridOverlap + gridHeight + gridOverlap
    const bottomSpacing = margin

    const timetableBackground = new Rect({
      width: leftSpacing + totalGridWidth + rightSpacing,
      height: topSpacing + totalGridHeight + bottomSpacing,
      fill: backgroundColor,
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
      left: timetableBackground.getScaledWidth() - margin,
      top: timetableBackground.getScaledHeight() - margin,
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

    this.CANVAS.add(timetableGroup)

    this.timetableGroup = timetableGroup
    this.cellGroup = cellGroup
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
