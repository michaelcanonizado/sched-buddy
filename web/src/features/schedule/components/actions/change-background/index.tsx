import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Image as ImageIcon } from 'lucide-react'
import { TextHeadingSM, TextBody } from '@/components/text'
import { cn } from '@/lib/utils'
import { ComponentClassNameAndChildrenProp } from '@/types'
import { useRef, useState } from 'react'
import AddImage from './add-image'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import AddFill from './add-fill'

function Card({
  heading,
  description,
  className,
  children,
}: { heading: string; description: string } & ComponentClassNameAndChildrenProp) {
  return (
    <div
      className={cn(
        'bg-muted flex aspect-square w-[350px] flex-col rounded-lg border',
        'hover:ring-ring hover:cursor-pointer hover:ring-[4px] hover:ring-offset-4',
        className,
      )}
    >
      <div className='relative grow overflow-hidden'>{children}</div>
      <div className='border-t px-8 py-6'>
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
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapper}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <ImageIcon />
          Change Background
        </Button>
      </DialogTrigger>
      <DialogContent className='overflow-hidden sm:max-w-fit'>
        <DialogHeader>
          <DialogTitle>Change Background</DialogTitle>
        </DialogHeader>

        {
          /* Nothing selected or Image card clicked, but no image selected */
          (selected === null || (!imageUrl && selected === 'image')) && (
            <div className='grid grid-cols-[auto_auto] gap-8 p-8 *:grow'>
              <div
                onClick={() => {
                  setSelected('image')
                  fileInputRef.current?.click()
                }}
              >
                <Card heading='Image' description='Add an image to the schedule'>
                  <div className='absolute inset-0 flex items-start justify-center p-6'>
                    <Image
                      alt='Schedule with background image sample'
                      src='/mockup-01.png'
                      width={180}
                      height={360}
                      className='object-contain'
                    />
                  </div>
                </Card>
              </div>
              <div
                onClick={() => {
                  setSelected('fill')
                }}
              >
                <Card heading='Fill' description='Use a solid color as the background'>
                  <div className='absolute inset-0 flex items-start justify-center p-6'>
                    <Image
                      alt='Schedule with background image sample'
                      src='/mockup-02.png'
                      width={180}
                      height={360}
                      className='object-contain'
                    />
                  </div>
                </Card>
              </div>
            </div>
          )
        }
        <Input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          onChange={handleImageFileChange}
          className='hidden'
        />
        {selected === 'image' && imageUrl && (
          <AddImage imageUrl={imageUrl} setDialogOpen={onOpenChangeWrapper} />
        )}
        {selected === 'fill' && <AddFill setDialogOpen={onOpenChangeWrapper} />}
      </DialogContent>
    </Dialog>
  )
}
