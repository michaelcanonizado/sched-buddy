import Button from '@/components/button'
import { TextBody, TextDisplay, TextHeading } from '@/components/text'

export default function Home() {
  return (
    <div className='grid h-screen w-screen place-items-center'>
      <div className='flex flex-col items-center justify-center gap-12'>
        <div className='flex max-w-[700px] flex-col items-center gap-4'>
          <TextDisplay className='text-center'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </TextDisplay>
          <TextBody>
            Ut enim ad minim veniam, quis nostrud exercitation!
          </TextBody>
        </div>
        <div className='relative flex h-[100px] w-fit flex-row gap-4'>
          <div className='aspect-square size-[100px] rounded-full bg-[#d00000]' />
          <div className='aspect-square size-[100px] rounded-full bg-[#fb8500]' />
          <div className='aspect-square size-[100px] rounded-full bg-[#219ebc]' />
          <div className='aspect-square size-[100px] rounded-full bg-[#ffafcc]' />
          <div className='aspect-square size-[100px] rounded-full bg-[#70e000]' />
        </div>
        <div className='border-border mx-auto flex max-w-[500px] flex-col gap-8 rounded-xl border-2 border-dashed p-8'>
          <div className='flex flex-col gap-4'>
            <TextHeading className='text-start'>
              Nam vulputate fermentum tellus id fringilla praesent
            </TextHeading>
            <TextBody className='text-start'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              vulputate consequat est non finibus. Nam vulputate fermentum
              tellus id fringilla. Praesent gravida euismod.
            </TextBody>
          </div>
          <div className='flex w-full flex-row justify-center gap-4'>
            <Button>Get Started</Button>
            <Button variant='outline'>Pay ₱1000</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
