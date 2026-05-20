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
import { TabletSmartphone } from 'lucide-react'
import {
  displayGroups,
  Display,
  getDisplayDimensions,
  Orientation,
} from '@/features/schedule/lib/displays'
import { Dimension, useScheduleActions } from '@/features/schedule/store/use-schedule-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'
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

function DimensionPreview({
  dimension,
  className,
  orientation,
}: { dimension: Dimension; orientation: Orientation } & ComponentClassNameProp) {
  const label = `${dimension.width} x ${dimension.height}`

  return (
    <div
      className={cn(
        'bg-background grid place-items-center rounded-lg border',
        'transition-[aspect-ratio] duration-300 ease-in-out',
        orientation === 'portrait' ? 'h-full' : 'w-full',
        orientation === 'portrait' ? 'max-h-full' : 'max-w-full',
        className,
      )}
      style={{ aspectRatio: dimension.width / dimension.height }}
    >
      <TextSub className='text-muted-foreground'>{label}</TextSub>
    </div>
  )
}

export default function ChangeDisplay() {
  const defaultDisplay = displayGroups[0].displays[0]
  const { setDimension: setScheduleDimension } = useScheduleActions()
  const [orientation, setOrientation] = useState<Orientation>(defaultDisplay.defaultOrientation)
  const [display, setDisplay] = useState<Display>(defaultDisplay)

  const allDisplays = displayGroups.flatMap((group) => group.displays)

  function handleDisplayChange(value: string) {
    const found = allDisplays.find((d) => d.name === value) ?? defaultDisplay
    setDisplay(found)
    setOrientation(found.defaultOrientation)
  }

  function handleConfirm() {
    setScheduleDimension(getDisplayDimensions(display.dimensions, orientation))
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

        <div className='bg-muted h-fit px-8 py-6'>
          <Tabs
            defaultValue='presets'
            className='bg-background h-full rounded-2xl px-6 py-6 shadow-xs'
          >
            <TabsList className='w-full'>
              <TabsTrigger value='presets'>Presets</TabsTrigger>
              <TabsTrigger value='custom'>Custom</TabsTrigger>
            </TabsList>
            <TabsContent value='presets' className=''>
              <div className='grid h-full grid-cols-2 gap-8'>
                <div className='flex h-full w-full flex-col items-center gap-2'>
                  <TextBody>Preview</TextBody>
                  <div className='relative h-[250px] w-full grow'>
                    <div className='absolute inset-0 grid place-items-center overflow-hidden'>
                      <DimensionPreview
                        dimension={getDisplayDimensions(display.dimensions, orientation)}
                        orientation={orientation}
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex flex-col'>
                      <TextBody>Dimension</TextBody>
                      <TextSub className='text-muted-foreground'>Choose a device</TextSub>
                    </div>
                    <Select onValueChange={handleDisplayChange} defaultValue={defaultDisplay.name}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a device' />
                      </SelectTrigger>
                      <SelectContent className='z-[99999]' position='popper'>
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
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex flex-col'>
                      <TextBody>Orientation</TextBody>
                      <TextSub className='text-muted-foreground'>
                        Select the device orientation
                      </TextSub>
                    </div>
                    <Select
                      value={orientation}
                      onValueChange={(v) => setOrientation(v as Orientation)}
                    >
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
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

{
  /*
  
  <TabsContent value='custom' className='h-full'>
              <div className='grid h-full grid-cols-2'>
                <div className='flex h-full w-full flex-col items-center gap-2'>
                  <TextBody>Preview</TextBody>
                  <div className='grid grow place-items-center'>
                    <DimensionPreview
                      className='max-h-[200px]'
                      dimension={getDisplayDimensions(display.dimensions, orientation)}
                      orientation={orientation}
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-col'>
                    <TextBody>Dimension</TextBody>
                    <TextSub className='text-muted-foreground'>Set your own dimension</TextSub>
                  </div>
                  <div className='flex flex-row items-center gap-2'>
                    <Input />
                    <TextBody>x</TextBody>
                    <Input />
                  </div>
                </div>
              </div>
            </TabsContent>
  
  */
}
