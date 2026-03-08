import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { textBodyClassNames } from '../text'

/* focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive */
const buttonVariants = cva(
  "[&_svg:not([class*='size-'])]:size-6 inline-flex items-center justify-center gap-2 rounded-xl whitespace-nowrap outline-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50 shrink-0 [&_svg]:pointer-events-none transition-all",
  {
    variants: {
      variant: {
        default:
          'bg-foreground hover:bg-foreground/90 text-background hover:bg-foreground/90',
        outline:
          'bg-background hover:bg-background/90 border border-x-2 border-t-2 border-b-5 border-muted text-foreground hover:bg-muted/20',
        ghost: 'bg-transparent border border-transparent hover:border-border',
      },
      size: {
        default: 'px-8 py-3',
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

  return (
    <Comp
      data-slot='button'
      className={cn(
        textBodyClassNames,
        'font-heading font-[850] tracking-[0.3px]',
        buttonVariants({ variant, size, className }),
        'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:ring-[3px]',
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
