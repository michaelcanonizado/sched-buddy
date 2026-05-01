import WidthContainer from '@/components/container'
import {
  TextBody,
  TextDisplay,
  TextHeadingLG,
  TextHeadingMD,
  TextHeadingSM,
  TextSub,
} from '@/components/text'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

function Hero() {
  return (
    <div className='grid min-h-[750px] w-full place-items-center'>
      <div className='flex max-w-[450px] flex-col items-center gap-4 *:text-center'>
        <TextDisplay>Sched Buddy Design System</TextDisplay>
        <TextBody>
          Upload your COR and get a clean, editable weekly schedule in seconds.
        </TextBody>
      </div>
    </div>
  )
}

export default function DesignPage() {
  return (
    <div className='mb-[200px] flex min-h-screen w-screen flex-col'>
      <Hero />
      <WidthContainer>
        <div className='w-full rounded border p-8'>
          <div className='flex flex-col gap-8 *:text-center'>
            <TextDisplay>
              The quick brown fox jumps over the lazy dog
            </TextDisplay>
            <TextHeadingLG>
              The quick brown fox jumps over the lazy dog
            </TextHeadingLG>
            <TextHeadingMD>
              The quick brown fox jumps over the lazy dog
            </TextHeadingMD>
            <TextHeadingSM>
              The quick brown fox jumps over the lazy dog
            </TextHeadingSM>
            <TextBody>The quick brown fox jumps over the lazy dog</TextBody>
            <TextSub>The quick brown fox jumps over the lazy dog</TextSub>
          </div>
        </div>
      </WidthContainer>
    </div>
  )
}
