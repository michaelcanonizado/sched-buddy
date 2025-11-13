'use client'

import { TextHeading } from '@/components/text'
import { getAspectRatio } from '@/features/display/lib/get-aspect-ratio'
import {
  useDisplay,
  useDisplayOrientation,
} from '@/features/display/store/use-display-store'
import { cn } from '@/lib/utils'

export default function Schedule({ className }: ComponentClassNameProp) {
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
        /*
		aspectRatio:
          orientation === 'portrait'
            ? `${antecedent}/${consequent}`
            : `${consequent}/${antecedent}`,

		// landscape: {
		// 	width: 100%;
		// 	max-height: 100%;
		// }

		// portrait: {
		// 	height: 100%;
		// 	max-width: 100%;
		// }
        width: orientation === 'portrait' ? `auto` : `100%`,
        height: orientation === 'portrait' ? `100%` : `auto`,
        maxWidth: orientation === 'portrait' ? `100%` : `none`,
        maxHeight: orientation === 'portrait' ? `none` : `100%`,
		*/
        rotate: orientation === 'portrait' ? `0deg` : `-90deg`,
      }}
      className={cn(
        'grid place-items-center rounded-2xl bg-orange-500',
        'h-full max-w-min transition-all duration-300',
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
