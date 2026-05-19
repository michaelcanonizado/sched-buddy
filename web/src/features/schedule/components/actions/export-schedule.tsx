import { Button } from '@/components/ui/button'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import { ImageDownIcon } from 'lucide-react'
import { useScheduleStore } from '../../store/use-schedule-store'

export default function ExportSchedule() {
  const { title } = useScheduleStore()
  const canvasEngine = useCanvasEngine()

  const onExport = () => {
    if (!canvasEngine) {
      console.warn('Trying to export but no CanvasEngine in store')
      return
    }

    const { dataUrl, format } = canvasEngine.export()
    if (!dataUrl) return

    const fileName = title.length !== 0 ? title : 'schedule'
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${fileName}.${format}`
    link.click()
  }

  return (
    <Button variant='outline' onClick={onExport}>
      <ImageDownIcon />
      Save as Image
    </Button>
  )
}
