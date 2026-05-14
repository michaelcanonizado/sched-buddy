import { Button } from '@/components/ui/button'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import { cn } from '@/lib/utils'
import { useState } from 'react'
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

  const [crop, setCrop] = useState<CroppedArea>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState<Zoom>(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  async function handleConfirm() {
    if (!canvasEngine || !croppedAreaPixels) return
    await canvasEngine.addImage(imageUrl, croppedAreaPixels)
    setDialogOpen(false)
  }

  function getCanvasAspectRatio(): number {
    if (!canvasEngine) return 0
    const dimensions = canvasEngine.getCanvasDimenstions()
    return dimensions.width / dimensions.height
  }

  return (
    <div className='flex flex-col gap-8 p-8'>
      <div
        className={cn(
          'relative h-[500px] w-[750px] min-w-[500px] overflow-hidden rounded-xl',
          imageUrl.length === 0 ? 'border-border bg-muted border-2' : '',
        )}
      >
        <Cropper
          image={imageUrl}
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
      <div className=''>
        <Button onClick={handleConfirm}>Confirm</Button>
      </div>
    </div>
  )
}
