import WidthContainer from '@/components/container'
import ScanButton from '@/features/scanner/components'
import { TextHeadingSM, TextDisplay } from '@/components/text'
import { Button } from '@/components/ui/button'
import { Wand } from 'lucide-react'

export default function HomePage() {
  return (
    <div className='grid h-screen w-screen place-items-center'>
      <WidthContainer>
        <div className='flex flex-col items-center justify-center gap-8'>
          <div className='flex max-w-[500px] flex-col items-center gap-4'>
            <TextDisplay className='text-center'>Smart Schedules, Zero Confusion rddit</TextDisplay>
            <TextHeadingSM>Ut enim ad minim veniam, quis nostrud exercitation!</TextHeadingSM>
          </div>
          <div className='flex flex-row gap-2'>
            <ScanButton />
            <Button variant='outline'>
              <Wand />
              Create Manually
            </Button>
          </div>
        </div>
      </WidthContainer>
    </div>
  )
}
