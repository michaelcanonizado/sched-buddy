'use client'

import { TextHeading } from '@/components/text'
import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import { useDisplay } from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'

export default function Schedule({ className }: ComponentClassNameProp) {
  const display = useDisplay()
  const { antecedent, consequent } = getAspectRatio(
    display.dimensions.width,
    display.dimensions.height,
  )

  return (
    <div
      style={{
        aspectRatio: `${antecedent}/${consequent}`,
      }}
      className={cn(
        '*:text-background grid h-full w-min place-items-center rounded-2xl *:text-center',
        className,
      )}
    >
      <TextHeading>{display?.name}</TextHeading>
    </div>
  )
}
