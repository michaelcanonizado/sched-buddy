'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'

function AddBackgroundFill({ className }: ComponentClassNameProp) {
  return (
    <Button className={cn('', className)} variant='outline'>
      Fill
    </Button>
  )
}

export default AddBackgroundFill
