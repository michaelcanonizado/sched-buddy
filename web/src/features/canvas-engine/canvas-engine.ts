import { BackgroundImageContext } from './../schedule/store/use-schedule-store'
import {
  Canvas,
  FabricImage,
  FabricObject,
  FabricText,
  Group,
  Path,
  Point,
  Rect,
  Textbox,
  TextboxProps,
  TOptions,
} from 'fabric'
import { ScheduleStoreState, Settings } from '../schedule/store/use-schedule-store'
import { Day, Meeting, Time } from '../schedule/types'
import { Display } from '../schedule/lib/displays'
import { SetObjectOverride, ViewportState } from './use-canvas-engine-store'

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
      margin: number
      lineHeight: number
      heading: {
        fontSize: number
        fontWeight: number
        marginBottom: number
      }
      subheading: {
        fontSize: number
        fontWeight: number
        marginBottom: number
      }
      body: {
        fontSize: number
        fontWeight: number
        marginBottom: number
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
  timeFormat: Settings['timeFormat']
  startTime: number
  endTime: number
  days: Day[]
  cellWidth: number
  cellHeight: number
}

type OverflowedSubject = Meeting & {
  /* Total height of the content (title, prof, time, etc.) */
  contentHeight: number
  /* Current total height of the meeting cell */
  allocatedMeetingHeight: number
  /* The minimum height of the meeting that will fit the content */
  newMeetingHeight: number
}

export class CanvasEngine {
  private CANVAS: Canvas

  private TIMETABLE_GROUP_ID = 'timetableGroup'
  private TIMETABLE_GROUP: Group | null = null

  private DEFAULT_GRID_WIDTH = 1100
  private DEFAULT_GRID_HEIGHT = 800

  private LOGICAL_CANVAS_WIDTH: number = this.DEFAULT_GRID_WIDTH
  private LOGICAL_CANVAS_HEIGHT: number = this.DEFAULT_GRID_HEIGHT

  private DEFAULT_START_TIME = 8 * 60
  private DEFAULT_END_TIME = 17 * 60

  private DEFAULT_CANVAS_FILL = '#FFFFFF'
  private BACKGROUND_IMAGE: FabricImage | null = null

  private onObjectModified: SetObjectOverride | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.CANVAS = new Canvas(canvas)
    /* Force canvas dimensions to 0 so canvas dimension checking can ignore this initial dimension */
    this.CANVAS.setDimensions({ width: 0, height: 0 })

    this.attachListeners()
  }

  setOnObjectModified(cb: SetObjectOverride) {
    this.onObjectModified = cb
  }

  private attachListeners() {
    this.CANVAS.on('object:modified', (e) => {
      const obj = e.target as FabricObject

      if (!obj || !obj.toSave || !this.onObjectModified) return

      if (!obj.id) {
        console.error('Trying to save object without an id! Object: ', obj)
        return
      }

      this.onObjectModified(obj.id, {
        left: obj.left,
        top: obj.top,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        angle: obj.angle,
      })
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
      const zoom = containerHeight / this.LOGICAL_CANVAS_HEIGHT
      const scaledWidth = this.LOGICAL_CANVAS_WIDTH * zoom
      this.CANVAS.setDimensions({ height: containerHeight, width: scaledWidth })
      this.CANVAS.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    } else {
      /* Width-first scaling */
      const zoom = containerWidth / this.LOGICAL_CANVAS_WIDTH
      const scaledHeight = this.LOGICAL_CANVAS_HEIGHT * zoom
      this.CANVAS.setDimensions({ width: containerWidth, height: scaledHeight })
      this.CANVAS.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
    }
  }

  render(state: ScheduleStoreState, viewport: ViewportState) {
    const backgroundImage = this.BACKGROUND_IMAGE

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
          margin: 12,
          lineHeight: 0.8,
          heading: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 10,
          },
          subheading: {
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 5,
          },
          body: {
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 0,
          },
        },
      },
      backgroundColor: '#f2f2f2',
      margin: 18,
    }

    /* Determine the bounds the timetable will follow */
    const gridBounds = this._computeGridBounds(state, defaultTimetableStyle)

    /* Draw timetable */
    const { timetableGroup, meetingGroup } = this._drawTimetable(defaultTimetableStyle, gridBounds)

    /* Draw the subject meetings on top of the timetable */
    this._drawSubjectMeetings(state.subjects, defaultTimetableStyle, gridBounds, meetingGroup)

    /* Check for a dimension change before setting the canvas dimension */
    const canvasDimensionChanged = this._canvasDimensionChanged(state.display)

    /* Set the dimensions of the canvas */
    this._setCanvasDimension(timetableGroup, state.display)

    if (canvasDimensionChanged) {
      this._resetAllObjectPosition()
    } else {
      this._restoreSavedObjectsState(viewport)
    }

    /* If there was a background image and the dimension has not changed, bring back the image.
       Else, let the outside handle it xd */
    if (backgroundImage && !canvasDimensionChanged) {
      this.BACKGROUND_IMAGE = backgroundImage
      this.CANVAS.add(backgroundImage)
      this.CANVAS.sendObjectToBack(backgroundImage)
    }

    if (state.background.fill) {
      if (this.BACKGROUND_IMAGE) {
        console.warn('Schedule has both fill and image set!')
        /* Let the image win */
      }

      this.CANVAS.backgroundColor = state.background.fill
    } else {
      this.CANVAS.backgroundColor = this.DEFAULT_CANVAS_FILL
    }

    this.CANVAS.requestRenderAll()
  }

  _canvasDimensionChanged(currentDisplay: ScheduleStoreState['display']) {
    /* Ignore the initial creation and render of the canvas */
    if (this.CANVAS.getWidth() === 0 || this.CANVAS.getHeight() === 0) {
      return false
    }

    if (!currentDisplay) {
      const usingDefaultDimensions =
        this.LOGICAL_CANVAS_WIDTH === this.DEFAULT_GRID_WIDTH &&
        this.LOGICAL_CANVAS_HEIGHT === this.DEFAULT_GRID_HEIGHT
      // console.log('Canvas dimension changed: ', !usingDefaultDimensions)
      return !usingDefaultDimensions
    }

    const widthChanged = currentDisplay.dimensions.width !== this.LOGICAL_CANVAS_WIDTH
    const heightChanged = currentDisplay.dimensions.height !== this.LOGICAL_CANVAS_HEIGHT
    // console.log('Canvas dimension changed: ', widthChanged || heightChanged)

    return widthChanged || heightChanged
  }

  _restoreSavedObjectsState(viewport: ViewportState) {
    this.CANVAS.getObjects().forEach((obj) => {
      /* Find objects that were meant to be saved */
      if (!obj.id || !obj.toSave) return

      /* Search for the saved object override */
      const saved = viewport.objectOverrides[obj.id]

      /* If object was meant to be saved but no override was found (e.g: localStorage was cleared),
         reset its position. */
      if (saved === undefined) {
        this._resetObjectPosition(obj)
        return
      }

      obj.set({ ...saved })
      obj.setCoords()
    })
  }

  _resetAllObjectPosition() {
    this.CANVAS.getObjects().forEach((obj) => {
      if (!obj.id || !obj.toSave) return
      this._resetObjectPosition(obj)
      /* Trigger the listener to object positions */
      this.CANVAS.fire('object:modified', {
        target: obj,
      })
    })
  }

  _resetObjectPosition(obj: FabricObject) {
    if (obj.id !== this.TIMETABLE_GROUP_ID) {
      /* Centered in the canvas */
      const center = new Point(this.LOGICAL_CANVAS_WIDTH / 2, this.LOGICAL_CANVAS_HEIGHT / 2)
      obj.setXY(center, 'center', 'center')
      obj.setCoords()
    }

    const margin = 100
    /* Portrait */
    if (this.LOGICAL_CANVAS_WIDTH <= this.LOGICAL_CANVAS_HEIGHT) {
      obj.scaleToWidth(this.LOGICAL_CANVAS_WIDTH - margin)

      /* Position at the bottom with margin */
      const bottomX = this.LOGICAL_CANVAS_WIDTH / 2
      const bottomY = this.LOGICAL_CANVAS_HEIGHT - obj.getScaledHeight() / 2 - margin / 2
      obj.setXY(new Point(bottomX, bottomY), 'center', 'center')
    } else {
      /* Landscape */
      obj.scaleToHeight(this.LOGICAL_CANVAS_HEIGHT - margin)

      /* Centered in the canvas */
      const center = new Point(this.LOGICAL_CANVAS_WIDTH / 2, this.LOGICAL_CANVAS_HEIGHT / 2)
      obj.setXY(center, 'center', 'center')
    }

    obj.setCoords()
    return
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
    const rotatedWeek = [...DAYS.slice(startIndex), ...DAYS.slice(0, startIndex)]

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
    const hasSubjectOnAWeekend = weekends.some((day) => uniqueSubjectDays.has(day))
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

  _computeGridBounds(state: ScheduleStoreState, style: TimetableStyle): GridBounds {
    const timetableDays = this._getTimetableDays(
      state.subjects,
      state.settings.startOfWeek,
      state.settings.showWeekend,
    )

    const gridBounds = {
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

    if (state.subjects.length === 0) {
      return gridBounds
    }

    /* Determine the start and end times of the timetable */
    const { startTime, endTime } = this._getTimetableStartAndEndTime(state)
    gridBounds.startTime = startTime
    gridBounds.endTime = endTime

    const numberOfRows = this._calculateNumberOfRows(
      startTime,
      endTime,
      state.settings.timeResolution,
    )

    gridBounds.cellWidth = (gridBounds.gridWidth - 1) / gridBounds.days.length

    const gridHeight = this._getTimetableGridHeight(state.subjects, style, gridBounds)
    gridBounds.gridHeight = gridHeight
    gridBounds.cellHeight = (gridHeight - 1) / numberOfRows

    return gridBounds
  }

  _getTimetableGridHeight(
    subjects: ScheduleStoreState['subjects'],
    style: TimetableStyle,
    gridBounds: GridBounds,
  ): number {
    const numberOfGridRows = this._calculateNumberOfRows(
      gridBounds.startTime,
      gridBounds.endTime,
      gridBounds.timeResolution,
    )

    const overflowedSubjects = this._drawSubjectMeetings(subjects, style, gridBounds, new Group())

    if (overflowedSubjects.length === 0) {
      return this.DEFAULT_GRID_HEIGHT
    }
    // return this.DEFAULT_GRID_HEIGHT

    /* Find the meeeting that overflows the most */
    const mostOverflow = overflowedSubjects.reduce((max, current) => {
      const currentDif = Math.abs(current.contentHeight - current.allocatedMeetingHeight)
      const maxDif = Math.abs(max.contentHeight - max.allocatedMeetingHeight)
      return currentDif > maxDif ? current : max
    })

    const newCellHeight =
      mostOverflow.newMeetingHeight /
      ((mostOverflow.endTime - mostOverflow.startTime) / gridBounds.timeResolution)
    const newGridHeight = newCellHeight * numberOfGridRows + 1
    return newGridHeight
  }

  _drawSubjectMeetings(
    subjects: ScheduleStoreState['subjects'],
    style: TimetableStyle,
    gridBounds: GridBounds,
    containerGroup: Group,
  ): OverflowedSubject[] {
    const baseCellContentStyles: TOptions<TextboxProps> = {
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
      left: 0,
      lineHeight: style.grid.cell.lineHeight,
      fontFamily: style.grid.font,
    }

    const containerBounding = containerGroup.getBoundingRect()
    /* Adjust the left and top values to exclude the strokes of the grid */
    const containerLeft = containerBounding.left - style.grid.strokeWidth / 2
    const containerTop = containerBounding.top - style.grid.strokeWidth / 2

    /* Find the subjects that overflow its allocated meeting container  */
    const overflowedSubjects: OverflowedSubject[] = []

    subjects.forEach((subject) => {
      subject.meetings.forEach((meeting) => {
        const startTime = meeting.startTime
        const endTime = meeting.endTime

        meeting.days.forEach((day) => {
          const { width, height, left, top } = this._calculateSubjectLayout({
            startTime,
            endTime,
            day,
            gridBounds,
            cellGroup: {
              left: containerLeft,
              top: containerTop,
            },
            style,
          })
          /* Apply cell margin */
          const contentWidth = width - style.grid.cell.margin * 2

          const meetingContentObjects: FabricObject[] = []

          let topOffset = 0
          const meetingTitle = new Textbox(subject.title, {
            ...baseCellContentStyles,
            width: contentWidth,
            fontSize: style.grid.cell.heading.fontSize,
            fontWeight: style.grid.cell.heading.fontWeight,
            top: topOffset,
          })
          topOffset += meetingTitle.getScaledHeight() + style.grid.cell.heading.marginBottom
          meetingContentObjects.push(meetingTitle)

          if (meeting.instructor && meeting.instructor.length !== 0) {
            const meetingInstructor = new Textbox(meeting.instructor, {
              ...baseCellContentStyles,
              width: contentWidth,
              fontSize: style.grid.cell.subheading.fontSize,
              fontWeight: style.grid.cell.subheading.fontWeight,
              top: topOffset,
            })
            topOffset +=
              meetingInstructor.getScaledHeight() + style.grid.cell.subheading.marginBottom
            meetingContentObjects.push(meetingInstructor)
          }

          if (meeting.type && meeting.type.length !== 0) {
            const meetingType = new Textbox(meeting.type, {
              ...baseCellContentStyles,
              width: contentWidth,
              fontSize: style.grid.cell.body.fontSize,
              fontWeight: style.grid.cell.body.fontWeight,
              top: topOffset,
            })
            topOffset += meetingType.getScaledHeight() + style.grid.cell.body.marginBottom
            meetingContentObjects.push(meetingType)
          }

          const meetingTime = new Textbox(
            `${this._timeGenerateLabel(meeting.startTime, '12')}-${this._timeGenerateLabel(meeting.endTime, '12')}`,
            {
              ...baseCellContentStyles,
              width: contentWidth,
              fontSize: style.grid.cell.body.fontSize,
              fontWeight: style.grid.cell.body.fontWeight,
              top: topOffset,
            },
          )
          topOffset += meetingTime.getScaledHeight() + style.grid.cell.body.marginBottom
          meetingContentObjects.push(meetingTime)

          if (meeting.location && meeting.location.length !== 0) {
            const meetingLocation = new Textbox(meeting.location, {
              ...baseCellContentStyles,
              width: contentWidth,
              fontSize: style.grid.cell.body.fontSize,
              fontWeight: style.grid.cell.body.fontWeight,
              top: topOffset,
            })
            topOffset += meetingLocation.getScaledHeight()
            meetingContentObjects.push(meetingLocation)
          }

          const meetingContent = new Group(meetingContentObjects, {
            left: style.grid.cell.margin,
            fill: '#4287f5',
            top: height / 2 - topOffset / 2,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
          })

          const meetingBackground = new Rect({
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

          const meetingGroup = new Group([meetingBackground, meetingContent], {
            left,
            top,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
          })

          containerGroup.add(meetingGroup)

          const meetingContentHeight = meetingContent.getScaledHeight()

          if (meetingContentHeight > height) {
            if (overflowedSubjects.some((m) => m.id === meeting.id)) return

            overflowedSubjects.push({
              ...meeting,
              contentHeight: meetingContentHeight,
              allocatedMeetingHeight: height,
              newMeetingHeight: meetingContentHeight + style.grid.cell.margin * 2,
            })
          }
        })
      })
    })

    return overflowedSubjects
  }

  _calculateSubjectLayout({
    startTime,
    endTime,
    day,
    gridBounds,
    cellGroup,
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
  } {
    const dayIndex = gridBounds.days.indexOf(day)
    if (dayIndex === -1) {
      throw new Error('Unknown day found! Day of subject doesnt exist in gridBounds.days')
    }

    const width = gridBounds.cellWidth
    const height = gridBounds.cellHeight * ((endTime - startTime) / gridBounds.timeResolution)
    const left = cellGroup.left + gridBounds.cellWidth * dayIndex
    const top =
      cellGroup.top +
      gridBounds.cellHeight * ((startTime - gridBounds.startTime) / gridBounds.timeResolution)

    return {
      width,
      height,
      left,
      top,
    }
  }

  _setCanvasDimension(timetableGroup: Group, display: Display | null) {
    if (!display) {
      this.CANVAS.setDimensions({
        width: timetableGroup.getScaledWidth(),
        height: timetableGroup.getScaledHeight(),
      })

      this.LOGICAL_CANVAS_WIDTH = this.DEFAULT_GRID_WIDTH
      this.LOGICAL_CANVAS_HEIGHT = this.DEFAULT_GRID_HEIGHT

      timetableGroup.set({ selectable: false, evented: false })
    } else {
      const width = display.dimensions.width
      const height = display.dimensions.height

      this.LOGICAL_CANVAS_WIDTH = width
      this.LOGICAL_CANVAS_HEIGHT = height

      this.CANVAS.setDimensions({
        width: width,
        height: height,
      })
      timetableGroup.set({ selectable: true, evented: true })
    }
  }

  _calculateNumberOfRows(start: Time, end: Time, resolution: number): number {
    return (end - start) / resolution
  }

  _timeIncrement(time: Time, incrementInMinutes: number): Time {
    return time + incrementInMinutes
  }

  _timeGenerateLabel(totalMinutes: number, format: Settings['timeFormat']): string {
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

  _drawTimetable(
    style: TimetableStyle,
    bounds: GridBounds,
  ): { timetableGroup: Group; meetingGroup: Group } {
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

    const { gridWidth, gridHeight, startTime, endTime, timeResolution, timeFormat, days } = bounds

    const numberOfDays = days.length
    const columnWidth = (gridWidth - 1) / numberOfDays

    const numberOfRows = this._calculateNumberOfRows(startTime, endTime, timeResolution)
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
        const day = days[i].charAt(0).toUpperCase() + days[i].slice(1).toLowerCase()
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

      const label = new FabricText(this._timeGenerateLabel(currentTimeLabel, timeFormat), {
        left: -(gridOverlap + gridRowLabelGap),
        top: rowHeight * i,
        originX: 'right',
        fontFamily: gridFont,
        fontSize: gridFontSize,
        fontWeight: gridFontWeight,
        selectable: false,
        evented: false,
      })
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
    const meetingGroupBackground = new Rect({
      width: gridWidth,
      height: gridHeight,
      // fill: '#f2ff0f',
      fill: 'transparent',
    })
    const meetingGroup = new Group([meetingGroupBackground], {
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
    })

    const gridGroup = new Group([columnGroup, rowGroup, meetingGroup], {
      left: timetableBackground.getScaledWidth() - margin,
      top: timetableBackground.getScaledHeight() - margin,
      originX: 'right',
      originY: 'bottom',
    })

    const timetableGroup = new Group([timetableBackground, gridGroup], {
      toSave: true,
      id: this.TIMETABLE_GROUP_ID,
      // originX: 'center',
      originX: 'left',
      // originY: 'center',
      originY: 'top',
      left: 0,
      top: 0,
      selectable: true,
      evented: true,
    })

    this.TIMETABLE_GROUP = timetableGroup
    this.CANVAS.add(timetableGroup)

    return {
      timetableGroup,
      meetingGroup,
    }
  }

  export() {
    const format = 'png'
    const dataUrl = this.CANVAS.toDataURL({
      format: format,
      quality: 1,
      multiplier: 4,
    })
    return { dataUrl, format }
  }

  async cloneTimetableGroup() {
    /* Temporary fix! A cleaner solution is to add an id property to FabricObjects and search the canvas to keep it uniform to the codebase */
    if (!this.TIMETABLE_GROUP) return null
    return await this.TIMETABLE_GROUP.clone()
  }

  removeBackgroundImage() {
    if (!this.BACKGROUND_IMAGE) {
      this.BACKGROUND_IMAGE = null
      return
    }

    this.CANVAS.remove(this.BACKGROUND_IMAGE)
    this.BACKGROUND_IMAGE = null
  }

  async addBackgroundImage(
    imageUrl: string,
    backgroundImageContext: BackgroundImageContext,
  ): Promise<void> {
    this.CANVAS.backgroundColor = '#ffffff'

    const cropPixels = backgroundImageContext.cropArea
    const originalDimension = backgroundImageContext.originalDimension

    const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimenstions()

    /* If there is already an existing image, remove it */
    if (this.BACKGROUND_IMAGE) {
      this.removeBackgroundImage()
    }

    /* Create image object */
    const img = await FabricImage.fromURL(imageUrl)

    /* The scale factor is derived from the original crop */
    const scaleX = cropPixels.width / originalDimension.width
    const scaleY = cropPixels.height / originalDimension.height

    /* How many image pixels we need to fill the new canvas.
       If the canvasWidth was unchanged, the value will be the same */
    const newCropWidth = canvasWidth * scaleX
    const newCropHeight = canvasHeight * scaleY

    /* Keep the same center point from the original crop */
    const centerX = cropPixels.x + cropPixels.width / 2
    const centerY = cropPixels.y + cropPixels.height / 2

    /* Recompute crop origin from the center */
    const newCropX = centerX - newCropWidth / 2
    const newCropY = centerY - newCropHeight / 2

    /* Canvas might grow larger than the picture so add a clamp */
    const imgElement = img.getElement() as HTMLImageElement
    const imgNaturalWidth = imgElement.naturalWidth
    const imgNaturalHeight = imgElement.naturalHeight
    const clampedCropX = Math.max(0, Math.min(newCropX, imgNaturalWidth - newCropWidth))
    const clampedCropY = Math.max(0, Math.min(newCropY, imgNaturalHeight - newCropHeight))

    /* Perform crop and positioning */
    img.set({
      cropX: clampedCropX,
      cropY: clampedCropY,
      width: newCropWidth,
      height: newCropHeight,
      scaleX: canvasWidth / newCropWidth,
      scaleY: canvasHeight / newCropHeight,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      selectable: false,
      eventable: false,
    })

    this.BACKGROUND_IMAGE = img
    this.CANVAS.add(img)
    this.CANVAS.sendObjectToBack(img)
    this.CANVAS.renderAll()
  }

  getTimetableImageUrl() {
    if (!this.TIMETABLE_GROUP) return null
    return this.TIMETABLE_GROUP.toDataURL({ multiplier: 1 })
  }

  getCanvasDimenstions() {
    return {
      width: this.LOGICAL_CANVAS_WIDTH,
      height: this.LOGICAL_CANVAS_HEIGHT,
    }
  }

  dispose() {
    this.CANVAS.dispose()
  }
}
