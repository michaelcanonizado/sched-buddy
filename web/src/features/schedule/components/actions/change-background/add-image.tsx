import { TextBody } from '@/components/text'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import { setBackgroundImageDB } from '@/features/schedule/db/background-image'
import { useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { cn } from '@/lib/utils'
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'

type CroppedArea = { x: number; y: number }
type Zoom = number

export default function AddImage({
  imageUrl,
  setDialogOpen,
}: {
  imageUrl: string
  setDialogOpen: (open: boolean) => void
}) {
  const canvasEngine = useCanvasEngine()
  const { setBackgroundImageContext, setBackgroundFill } = useScheduleActions()

  const [crop, setCrop] = useState<CroppedArea>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState<Zoom>(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [transformedImageUrl, setTransformedImageUrl] = useState(imageUrl)

  /* Re-render the image to a canvas whenever flip/rotation changes */
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const rad = (rotation * Math.PI) / 180
      const sin = Math.abs(Math.sin(rad))
      const cos = Math.abs(Math.cos(rad))
      const width = img.width * cos + img.height * sin
      const height = img.width * sin + img.height * cos

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.translate(width / 2, height / 2)
      ctx.rotate(rad)
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      setTransformedImageUrl(canvas.toDataURL())
      /* Reset crop position when transform changes (crop position and zoom level can be stored, future improvement) */
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    img.src = imageUrl
  }, [imageUrl, flipH, flipV, rotation])

  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  async function handleConfirm() {
    if (!canvasEngine || !croppedAreaPixels) return

    const canvasDimension = canvasEngine.getCanvasDimenstions()

    /* Save the transformed image (flipped and rotation applied) */
    await setBackgroundImageDB(transformedImageUrl)
    setBackgroundImageContext({
      cropArea: croppedAreaPixels,
      originalDimension: { width: canvasDimension.width, height: canvasDimension.height },
    })
    setBackgroundFill(null)
    setDialogOpen(false)
  }

  function getCanvasAspectRatio(): number {
    if (!canvasEngine) return 0
    const dimensions = canvasEngine.getCanvasDimenstions()
    return dimensions.width / dimensions.height
  }

  return (
    <div className='flex flex-col'>
      <div className='bg-muted p-8'>
        <div
          className={cn(
            'relative h-[500px] w-[750px] min-w-[500px] overflow-hidden rounded-xl',
            imageUrl.length === 0 ? 'border-border bg-muted border-2' : '',
          )}
        >
          <Cropper
            image={transformedImageUrl}
            crop={crop}
            zoom={zoom}
            zoomWithScroll={true}
            aspect={getCanvasAspectRatio()}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{ containerClassName: 'bg-muted' }}
          />
        </div>
      </div>
      <DialogFooter className='flex flex-row items-end sm:justify-between'>
        <div className='flex items-end gap-4'>
          <div className='flex flex-col gap-1'>
            <TextBody className='text-center'>Flip</TextBody>
            <div className='flex flex-row gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setFlipH((prev) => !prev)}
                title='Flip horizontal'
                aria-pressed={flipH}
                className={cn(flipH && 'bg-muted')}
              >
                <FlipHorizontal2 className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setFlipV((prev) => !prev)}
                title='Flip vertical'
                aria-pressed={flipV}
                className={cn(flipV && 'bg-muted')}
              >
                <FlipVertical2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <TextBody className='text-center'>Rotate</TextBody>
            <div className='flex flex-row gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                title='Rotate counter-clockwise'
              >
                <RotateCcw className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                title='Rotate clockwise'
              >
                <RotateCw className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
        <div className=''>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </DialogFooter>
    </div>
  )
}
