import { Canvas, FabricText, Group, Path, Rect } from 'fabric'
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
  private gridOverlap = 0
  private daysOfTheWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = new Canvas(canvas, {
      width: 1100,
      height: 700,
    })
  }

  render(state: ScheduleStoreState) {
    console.log('Rerendering canvas with state: ', state)
    this.canvas.clear()
    this._drawTimetableGrid()
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

  _timeIncrement(time: Time, incrementInMinutes: number): Time {
    if (incrementInMinutes < 0) {
      console.warn(
        "timeIncrement() error! Can't increment time with negative number: \n",
        'time: ',
        time,
        ' incrementInMinutes: ',
        incrementInMinutes,
      )
    }

    const totalMinutes = time.hours * 60 + time.minutes + incrementInMinutes
    /* If the time and incrementMinute passed will result in overlap, wrap it to the next day */
    const wrappedMinutes = ((totalMinutes % 1440) + 1440) % 1440
    const hours = Math.floor(wrappedMinutes / 60)
    const minutes = wrappedMinutes % 60

    return { hours, minutes }
  }

  _timeGenerateLabel(time: Time, format: '12' | '24'): string {
    if (
      time.hours > 23 ||
      time.hours < 0 ||
      time.minutes > 59 ||
      time.minutes < 0
    ) {
      console.warn('Invalid time format: ', time)
    }

    if (format === '24') {
      return `${time.hours}:${time.minutes.toString().padStart(2, '0')}`
    }

    const isAM = time.hours < 12
    let hour = time.hours % 12
    if (hour === 0) hour = 12
    const minute = time.minutes.toString().padStart(2, '0')
    const meridiem = isAM ? 'AM' : 'PM'
    return `${hour}:${minute}${meridiem}`
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
