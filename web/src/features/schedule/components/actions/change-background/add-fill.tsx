import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import {
  ColorArea,
  ColorField,
  ColorPicker as Picker,
  ColorSlider,
  ColorThumb,
  SliderTrack,
} from '@/components/ui/color'
import { parseColor, Input as ColorInput, Color } from 'react-aria-components'
import { inputClassNames } from '@/components/ui/input'
import { TextBody } from '@/components/text'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

function MimicCanvas({
  backgroundColor,
  className,
  timetableImageUrl,
}: {
  timetableImageUrl: string | null
  backgroundColor: string
} & ComponentClassNameProp) {
  return (
    <div
      className={cn('grid size-full place-items-center p-4', className)}
      style={{ backgroundColor }}
    >
      <div className='relative aspect-square h-full overflow-hidden rounded-sm'>
        {timetableImageUrl ? (
          <Image
            src={timetableImageUrl}
            alt='timetable'
            draggable={false}
            unoptimized
            fill
            className='object-contain'
          />
        ) : (
          <div className='bg-muted size-full' />
        )}
      </div>
    </div>
  )
}

function ColorPicker({ onChange, value }: { value: Color; onChange: (value: Color) => void }) {
  return (
    <Picker value={value} onChange={onChange}>
      <div className='flex w-full flex-col gap-0 outline-none'>
        <ColorArea
          colorSpace='hsb'
          xChannel='saturation'
          yChannel='brightness'
          className='h-[100px] w-full rounded-b-none border-b-0'
        >
          <ColorThumb className='z-50' />
        </ColorArea>
        <ColorSlider colorSpace='hsb' channel='hue'>
          <SliderTrack className='w-full rounded-t-none border-t-0'>
            <ColorThumb className='top-1/2' />
          </SliderTrack>
        </ColorSlider>
      </div>
      <div className='flex w-full flex-col gap-1 *:grow'>
        <TextBody className='text-center font-semibold'>Hex</TextBody>
        <ColorField className='flex flex-col gap-2' aria-label='hex color'>
          <ColorInput className={cn(inputClassNames, 'text-center')} />
        </ColorField>
      </div>
    </Picker>
  )
}

function toHex(color: Color) {
  return `#${color.toHexInt().toString(16).padStart(6, '0')}`
}

export default function AddFill({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const canvasEngine = useCanvasEngine()
  const [backgroundColor, setBackgroundColor] = useState<Color>(parseColor('#ffffff'))

  const timetableImageUrl = useMemo(() => {
    if (!canvasEngine) return null
    return canvasEngine.getTimetableImageUrl()
  }, [canvasEngine])

  function onConfirm() {
    if (!canvasEngine) return
    canvasEngine.addBackgroundFill(toHex(backgroundColor))
    setDialogOpen(false)
  }

  return (
    <>
      <div className='bg-muted max-h-[650px] min-h-[300px] max-w-[600px] min-w-[300px] overflow-y-scroll'>
        <div className='flex flex-col gap-4 p-8'>
          <div className='flex flex-col gap-2'>
            <TextBody className='text-center font-semibold'>Color Preview</TextBody>
            <div className='h-[300px] w-[500px]'>
              <MimicCanvas
                timetableImageUrl={timetableImageUrl}
                backgroundColor={toHex(backgroundColor)}
                className='grow rounded-lg'
              />
            </div>
          </div>
          <ColorPicker value={backgroundColor} onChange={setBackgroundColor} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogFooter>
    </>
  )
}
