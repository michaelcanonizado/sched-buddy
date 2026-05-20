import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TabletSmartphone, X } from 'lucide-react'
import {
  displayGroups,
  Display,
  getDisplayDimensions,
  Orientation,
} from '@/features/schedule/lib/displays'
import {
  Dimension,
  useScheduleActions,
  useScheduleDimension,
} from '@/features/schedule/store/use-schedule-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ComponentChildrenProp, ComponentClassNameProp } from '@/types'
import { TextBody, TextSub } from '@/components/text'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

function DimensionPreview({
  dimension,
  className,
  orientation,
}: { dimension: Dimension; orientation: Orientation } & ComponentClassNameProp) {
  return (
    <div
      className={cn(
        'bg-background grid place-items-center rounded-lg border',
        // 'transition-[aspect-ratio] duration-300 ease-in-out',
        orientation === 'landscape' ? 'w-full' : 'h-full',
        'max-h-full max-w-full',
        className,
      )}
      style={{ aspectRatio: dimension.width / dimension.height }}
    />
  )
}

function CustomDisplay({
  id,
  onValueChange,
  defaultDimension,
}: {
  id: string
  onValueChange: (dimension: Dimension) => void
  defaultDimension: Dimension
}) {
  const displayId = 'custom'
  const defaultWidth = defaultDimension.id === displayId ? defaultDimension.width : 402
  const defaultHeight = defaultDimension.id === displayId ? defaultDimension.height : 874

  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const orientation: Orientation = width <= height ? 'portrait' : 'landscape'

  function handleOrientationChange(value: Orientation) {
    setWidth(height)
    setHeight(width)
    onValueChange({ width: height, height: width, id: displayId })
  }

  function handleWidthChange(value: number) {
    const clamped = Math.max(1, value || 1)
    setWidth(clamped)
    onValueChange({ width: clamped, height, id: displayId })
  }
  function handleHeightChange(value: number) {
    const clamped = Math.max(1, value || 1)
    setHeight(clamped)
    onValueChange({ width, height: clamped, id: displayId })
  }

  return (
    <ChangeDisplayTab
      id={id}
      dimension={{ width, height, id: displayId }}
      orientation={orientation}
      setOrientation={handleOrientationChange}
    >
      <div className='flex flex-col'>
        <TextBody>Dimension</TextBody>
        <TextSub className='text-muted-foreground'>Use a custom dimension</TextSub>
      </div>
      <div className='flex items-center gap-2'>
        <div className='flex flex-col gap-1'>
          <TextSub className='text-muted-foreground'>Width</TextSub>
          <Input
            type='number'
            value={width}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            min={1}
          />
        </div>
        <X className='text-muted-foreground mt-5 shrink-0' size={14} />
        <div className='flex flex-col gap-1'>
          <TextSub className='text-muted-foreground'>Height</TextSub>
          <Input
            type='number'
            value={height}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            min={1}
          />
        </div>
      </div>
    </ChangeDisplayTab>
  )
}

function PresetDisplays({
  id,
  onValueChange,
  defaultDimension,
}: {
  id: string
  defaultDimension: Dimension
  onValueChange: (dimension: Dimension) => void
}) {
  const allDisplays = displayGroups.flatMap((group) => group.displays)
  const defaultDisplay =
    allDisplays.find((d) => d.name === defaultDimension.id) ?? displayGroups[0].displays[0]

  const [orientation, setOrientation] = useState<Orientation>(
    defaultDimension.height > defaultDimension.width ? 'portrait' : 'landscape',
  )
  const [display, setDisplay] = useState<Display>(defaultDisplay)

  function handleDisplayChange(value: string) {
    const found = allDisplays.find((d) => d.name === value) ?? defaultDisplay
    const newDimension = {
      ...getDisplayDimensions(found.dimensions, found.defaultOrientation),
      id: found.name,
    }

    /* Update local state */
    setDisplay(found)
    setOrientation(found.defaultOrientation)

    /* Update external state */
    onValueChange(newDimension)
  }

  function handleOrientationChange(value: Orientation) {
    const newDimension = {
      ...getDisplayDimensions(display.dimensions, value),
      id: display.name,
    }
    /* Update local state */
    setOrientation(value)

    /* Update external state */
    onValueChange(newDimension)
  }

  return (
    <ChangeDisplayTab
      id={id}
      dimension={{ ...getDisplayDimensions(display.dimensions, orientation), id: display.name }}
      orientation={orientation}
      setOrientation={handleOrientationChange}
    >
      <div className='flex flex-col'>
        <TextBody>Dimension</TextBody>
        <TextSub className='text-muted-foreground'>Choose a device</TextSub>
      </div>
      <Select onValueChange={handleDisplayChange} defaultValue={display.name}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Select a device' />
        </SelectTrigger>
        <SelectContent className='z-99999' position='popper'>
          {displayGroups.map((group, groupIndex) => {
            return (
              <SelectGroup key={`${group.name}.${groupIndex}`}>
                <SelectLabel>{group.name}</SelectLabel>
                {group.displays.map((display, displayIndex) => {
                  return (
                    <SelectItem
                      key={`${display.name}.${displayIndex}`}
                      value={display.name}
                      className='flex flex-row items-center'
                    >
                      <TextBody>{display.name}</TextBody>
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            )
          })}
        </SelectContent>
      </Select>
    </ChangeDisplayTab>
  )
}

function ChangeDisplayTab({
  dimension,
  children,
  orientation,
  setOrientation,
  id,
}: {
  id: string
  dimension: Dimension
  orientation: Orientation
  setOrientation: (orientation: Orientation) => void
} & ComponentChildrenProp) {
  const label = `${dimension.width} x ${dimension.height}`

  return (
    <TabsContent value={id} className=''>
      <div className='grid h-full grid-cols-2 gap-6'>
        <div className='flex h-full w-full flex-col items-center gap-4'>
          <TextBody>Preview</TextBody>
          <div className='bg-muted relative h-[250px] w-full grow rounded-lg'>
            <div className='absolute inset-4 grid place-items-center overflow-hidden'>
              <DimensionPreview dimension={dimension} orientation={orientation} />
            </div>
          </div>
          <TextSub className='text-muted-foreground'>{label}</TextSub>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>{children}</div>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col'>
              <TextBody>Orientation</TextBody>
              <TextSub className='text-muted-foreground'>Select the device orientation</TextSub>
            </div>
            <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select an orientation' />
              </SelectTrigger>
              <SelectContent className='z-[99999]' position='popper'>
                <SelectItem value='portrait'>Portrait</SelectItem>
                <SelectItem value='landscape'>Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

export default function ChangeDisplay() {
  const { setDimension: setScheduleDimension } = useScheduleActions()
  const defaultDimension = useScheduleDimension()

  const defaultPresetDimension = {
    ...getDisplayDimensions(
      displayGroups[0].displays[0].dimensions,
      displayGroups[0].displays[0].defaultOrientation,
    ),
    id: displayGroups[0].displays[0].name,
  }
  const defaultCustomDimension: Dimension = { width: 1081, height: 1920, id: 'custom' }

  const [dimension, setDimension] = useState<Dimension>(defaultPresetDimension)
  const [presetDimension, setPresetDimension] = useState<Dimension>(defaultPresetDimension)
  const [customDimension, setCustomDimension] = useState<Dimension>(defaultCustomDimension)

  function handleTabChange(tab: string) {
    setDimension(tab === 'presets' ? presetDimension : customDimension)
  }

  function onConfirm() {
    setScheduleDimension(dimension)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <TabletSmartphone />
          Change Display
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Display</DialogTitle>
          <DialogDescription>Change the background device</DialogDescription>
        </DialogHeader>

        <div className='bg-muted h-fit px-8 py-4'>
          <Tabs
            defaultValue='presets'
            onValueChange={handleTabChange}
            className='bg-background h-full gap-4 rounded-2xl px-6 py-6 shadow-xs'
          >
            <TabsList className='w-full'>
              <TabsTrigger value='presets'>Presets</TabsTrigger>
              <TabsTrigger value='custom'>Custom</TabsTrigger>
            </TabsList>
            <PresetDisplays
              id='presets'
              defaultDimension={defaultDimension}
              onValueChange={(dim) => {
                setPresetDimension(dim)
                setDimension(dim)
              }}
            />
            <CustomDisplay
              id='custom'
              defaultDimension={defaultDimension}
              onValueChange={(dim) => {
                setCustomDimension(dim)
                setDimension(dim)
              }}
            />
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onConfirm}>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
