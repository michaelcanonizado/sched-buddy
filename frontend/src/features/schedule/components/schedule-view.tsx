'use client'

import { TextHeading } from '@/components/text'
import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import {
  useDisplay,
  useDisplayOrientation,
} from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'

export default function ScheduleView({ className }: ComponentClassNameProp) {
  const display = useDisplay()
  const orientation = useDisplayOrientation()
  const { antecedent, consequent } = getAspectRatio(
    display.dimensions.width,
    display.dimensions.height,
  )

  return (
    <div
      style={{
        aspectRatio: `${antecedent}/${consequent}`,
        rotate: orientation === 'portrait' ? `0deg` : `-90deg`,
      }}
      className={cn(
        'grid place-items-center bg-orange-500',
        'h-full max-w-min transition-all duration-300',
        display.type !== 'phone' && display.type !== 'tablet'
          ? 'rounded-none'
          : 'rounded-2xl',
        className,
      )}
    >
      <div
        style={{
          rotate: orientation === 'portrait' ? `0deg` : `90deg`,
        }}
      >
        <TextHeading className='text-background'>{display?.name}</TextHeading>
      </div>
    </div>
  )
}
