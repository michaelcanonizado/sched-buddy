import {
  Canvas,
  FabricImage,
  ImageProps,
  ObjectEvents,
  Rect,
  SerializedImageProps,
} from 'fabric'

export class ImagePreviewCanvasEngine {
  private CANVAS: Canvas

  constructor(canvas: HTMLCanvasElement) {
    this.CANVAS = new Canvas(canvas, {
      width: 500,
      height: 500,
      backgroundColor: '#ffffff',
    })

    /* Overlay */
    const bg = new Rect({
      width: this.CANVAS.getWidth(),
      height: this.CANVAS.getHeight(),
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      selectable: false,
      evented: false,
      opacity: 0.5,
      fill: '#E7F3FF',
    })
    /* Shape to subtract */
    const cutout = new Rect({
      width: 200,
      height: 200,
      left: bg.getScaledWidth() / 2,
      top: bg.getScaledHeight() / 2,
      originX: 'center',
      originY: 'center',
      inverted: true,
      absolutePositioned: true,
    })
    bg.clipPath = cutout
    this.CANVAS.add(bg)

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
