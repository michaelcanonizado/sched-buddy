import { TimetableSnapshot } from '@/features/canvas-engine/canvas-engine'
import { useCanvasEngine } from '@/features/canvas-engine/use-canvas-engine-store'
import { cn } from '@/lib/utils'
import { ComponentChildrenProp, ComponentClassNameProp } from '@/types'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  ColorArea,
  ColorField,
  ColorPicker as Picker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  SliderTrack,
} from '@/components/ui/color'
import { parseColor, Input as ColorInput, Color } from 'react-aria-components'
import { inputClassNames } from '@/components/ui/input'
import { TextBody } from '@/components/text'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

interface MimicCanvasProps {
  snapshot: TimetableSnapshot
  backgroundColor: string
}

function MimicCanvas({
  snapshot,
  backgroundColor,
  className,
}: MimicCanvasProps & ComponentClassNameProp) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  const {
    imageSrc,
    left,
    top,
    scaleX,
    scaleY,
    angle,
    width: groupW,
    height: groupH,
    canvasWidth,
    canvasHeight,
  } = snapshot

  /* Compute wrappe -> logical scale from the container's rendered width.
  ResizeObserver keeps it correct if the dialog/container resizes. */
  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / canvasWidth)
    })
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [canvasWidth])

  return (
    <div
      ref={wrapperRef}
      className={cn('border-2', className)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        overflow: 'hidden',
        backgroundColor,
      }}
    >
      {scale !== null && (
        <Image
          src={imageSrc}
          alt='timetable'
          draggable={false}
          /* a data-URL is passed, no Next.js optimization needed */
          unoptimized
          width={groupW * scaleX * scale}
          height={groupH * scaleY * scale}
          style={{
            position: 'absolute',
            left: left * scale,
            top: top * scale,
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'top left',
            display: 'block',
          }}
        />
      )}
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
        <TextBody className='text-center'>Hex</TextBody>
        <ColorField className='flex flex-col gap-2' aria-label='hex color'>
          <ColorInput className={cn(inputClassNames, 'text-center')} />
        </ColorField>
      </div>
    </Picker>
  )
}

export default function AddFill({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const canvasEngine = useCanvasEngine()
  const [backgroundColor, setBackgroundColor] = useState<Color>(parseColor('#ffffff'))

  const snapshot = useMemo(() => {
    if (!canvasEngine) return null
    const snap = canvasEngine.getTimetableSnapshot()
    if (!snap) return null
    const { width: canvasWidth, height: canvasHeight } = canvasEngine.getCanvasDimenstions()
    return { ...snap, canvasWidth, canvasHeight }
  }, [canvasEngine])

  return (
    <>
      <div className='bg-muted h-fit max-h-[650px] w-[600px] overflow-y-scroll'>
        <div className='flex flex-col gap-4 p-8'>
          <div className=''>
            {snapshot && (
              <MimicCanvas
                className='rounded-lg'
                snapshot={snapshot}
                backgroundColor={`#${backgroundColor.toHexInt().toString(16).padStart(6, '0')}`}
              />
            )}
          </div>
          <ColorPicker value={backgroundColor} onChange={setBackgroundColor} />
        </div>
      </div>
      <DialogFooter>
        <Button>Confirm</Button>
      </DialogFooter>
    </>
  )
}
