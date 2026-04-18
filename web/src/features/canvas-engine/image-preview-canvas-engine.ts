import { Canvas, FabricImage, Group, Rect } from 'fabric'

export class ImagePreviewCanvasEngine {
  private CANVAS: Canvas

  constructor(
    canvas: HTMLCanvasElement,
    scheduleContext: {
      width: number
      height: number
      timetableGroup: Group
    },
  ) {
    this.CANVAS = new Canvas(canvas, {
      width: 500,
      height: 500,
      backgroundColor: '#ffffff',
    })
    const CANVAS_WIDTH = this.CANVAS.getWidth()
    const CANVAS_HEIGHT = this.CANVAS.getHeight()

    /* Overlay */
    const bg = new Rect({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      opacity: 0.5,
      fill: '#E7F3FF',
    })

    const cutoutScale = 0.8
    let cutoutWidth = 200
    let cutoutHeight = 200

    /* Determine the dimensions of the cutout based on the current schedule's dimensions */
    const isHeightGreater = scheduleContext.height > scheduleContext.width
    if (isHeightGreater) {
      cutoutHeight = CANVAS_HEIGHT * cutoutScale
      cutoutWidth =
        cutoutHeight * (scheduleContext.width / scheduleContext.height)
    } else {
      cutoutWidth = CANVAS_WIDTH * cutoutScale
      cutoutHeight =
        cutoutWidth * (scheduleContext.height / scheduleContext.width)
    }
    const scheduleRelativeLeft = (CANVAS_WIDTH - cutoutWidth) / 2
    const scheduleRelativeTop = (CANVAS_HEIGHT - cutoutHeight) / 2

    /* Shape to subtract */
    const cutout = new Rect({
      width: cutoutWidth,
      height: cutoutHeight,
      left: bg.getScaledWidth() / 2,
      top: bg.getScaledHeight() / 2,
      originX: 'center',
      originY: 'center',
      inverted: true,
      absolutePositioned: true,
    })

    bg.clipPath = cutout
    this.CANVAS.add(bg)

    const left = scheduleContext.timetableGroup.left
    const top = scheduleContext.timetableGroup.top
    console.log(scheduleContext.timetableGroup)
    console.log(
      `sW: ${scheduleContext.width}, sH: ${scheduleContext.height} | l: ${left}, t: ${top}`,
    )

    const timetableNewLeft = scheduleRelativeLeft
    const timetableNewTop = scheduleRelativeTop
    const scheduleScale = cutoutWidth / scheduleContext.width
    console.log(
      `scheduleScale = ${cutoutWidth} / ${scheduleContext.width} = ${scheduleScale}`,
    )

    console.log(
      `${timetableNewLeft} + (${scheduleContext.timetableGroup.left} * ${scheduleScale}) =`,
      timetableNewLeft + scheduleContext.timetableGroup.left * scheduleScale,
    )

    scheduleContext.timetableGroup.scaleToWidth(cutoutWidth)

    // scheduleContext.timetableGroup.scaleX = scheduleScale
    // scheduleContext.timetableGroup.scaleY = scheduleScale

    scheduleContext.timetableGroup.set({
      left: timetableNewLeft,
      // left:
      // timetableNewLeft + scheduleContext.timetableGroup.left * scheduleScale,
      top: timetableNewTop,
      // originX: 'center',
      // originY: 'center',
    })

    this.CANVAS.add(scheduleContext.timetableGroup)

    this.CANVAS.renderAll()
  }

  async addImage(url: string) {
    try {
      const img = await FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      })

      img.set({
        left: this.CANVAS.getWidth() / 2,
        top: this.CANVAS.getHeight() / 2,
        originX: 'center',
        originY: 'center',
      })
      img.scaleToWidth(this.CANVAS.width / 1.5)

      this.CANVAS.add(img)
      this.CANVAS.sendObjectToBack(img)
      this.CANVAS.renderAll()

      return img
    } catch (error) {
      console.error('Failed to load image:', error)
      throw error
    }
  }

  dispose() {
    this.CANVAS.dispose()
  }
}
