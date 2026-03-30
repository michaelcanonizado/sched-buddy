'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ComponentClassNameProp } from '@/types'

function AddBackgroundImage({ className }: ComponentClassNameProp) {
  return (
    <Button className={cn('', className)} variant='outline'>
      Image
    </Button>
  )
}

export default AddBackgroundImage
