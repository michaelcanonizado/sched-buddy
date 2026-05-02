import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { textBodyClassNames } from '../text'

const buttonVariants = cva(
  "[&_svg:not([class*='size-'])]:size-5 inline-flex items-center justify-center gap-1 rounded-full whitespace-nowrap outline-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50 shrink-0 [&_svg]:pointer-events-none transition-all hover:scale-[102%]",
  {
    variants: {
      variant: {
        default:
          'bg-foreground-200 border-x-2 border-t-2 border-b-5 border-border text-background',
        outline:
          'bg-background  border-x-2 border-t-2 border-b-5 border-border text-foreground-200',
      },
      size: {
        default: 'px-4 py-2',
        icon: 'p-2 size-fit rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  const focusClasses =
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
  const errorClasses =
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'

  return (
    <Comp
      data-slot='button'
      className={cn(
        textBodyClassNames,
        buttonVariants({ variant, size, className }),
        focusClasses,
        errorClasses,
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
