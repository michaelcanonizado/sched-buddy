import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TabletSmartphone } from 'lucide-react'
import { TextHeadingSM, TextBody } from '@/components/text'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'
import { useRef, useState } from 'react'
import AddImage from './add-image'
import { Input } from '@/components/ui/input'

function Card({
  heading,
  description,
  className,
}: { heading: string; description: string } & ComponentClassNameProp) {
  return (
    <div
      className={cn(
        'bg-muted flex aspect-square w-[350px] flex-col rounded-lg border *:px-8 *:py-6',
        'hover:ring-ring hover:cursor-pointer hover:ring-[4px] hover:ring-offset-4',
        className,
      )}
    >
      <div className='grow'></div>
      <div className='border-t'>
        <TextHeadingSM>{heading}</TextHeadingSM>
        <TextBody className='text-muted-foreground'>{description}</TextBody>
      </div>
    </div>
  )
}

export default function ChangeBackground() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<'image' | 'fill' | null>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (!file) return

    try {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    } catch (e) {
      console.log('Error!: ', e)
    }
  }

  const onOpenChangeWrapper = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => {
        setImageUrl(null)
        setSelected(null)
      }, 100)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <TabletSmartphone />
          Change Background
        </Button>
      </DialogTrigger>
      <DialogContent className='overflow-hidden sm:max-w-fit'>
        <DialogHeader>
          <DialogTitle>Change Background</DialogTitle>
        </DialogHeader>

        {selected === null && (
          <div className='grid grid-cols-[auto_auto] gap-8 p-8 *:grow'>
            <div
              onClick={() => {
                setSelected('image')
                fileInputRef.current?.click()
              }}
            >
              <Card heading='Image' description='Add an image to the schedule' />
            </div>
            <div
              onClick={() => {
                setSelected('fill')
              }}
            >
              <Card heading='Fill' description='Use a solid color as the background' />
            </div>
          </div>
        )}
        <Input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          onChange={handleImageFileChange}
          className='hidden'
        />
        {selected === 'image' && (
          <AddImage imageUrl={imageUrl ?? ''} setDialogOpen={onOpenChangeWrapper} />
        )}
        {selected === 'fill' && <div className='h-[200px] w-[1000px]'></div>}
      </DialogContent>
    </Dialog>
  )
}
