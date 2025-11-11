import {
  TextBody,
  textBodyClassNames,
  TextDisplay,
  TextHeading,
  TextSub,
} from '@/components/text'
import { cn } from '@/lib/cn'

function Button({ className, children }: ComponentClassNameAndChildrenProp) {
  return (
    <button
      className={cn(
        textBodyClassNames,
        'text-background font-heading font-[850] tracking-[0.3px]',
        "[&_svg:not([class*='size-'])] *:text-background inline-flex items-center justify-center gap-2 rounded-xl border-b-4 border-[#58a700] bg-[#58cc02] px-8 py-3 whitespace-nowrap outline-none hover:cursor-pointer hover:bg-[#61E002] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  )
}

export default function Home() {
  return (
    <div className='grid h-screen w-screen place-items-center'>
      <div className='my-[200px] flex flex-row items-center gap-12'>
        <div className='max-w-[600px]'>
          <TextDisplay className='text-center'>
            Sched Buddy. Nam vulputate fermentum tellus id fringilla. Praesent
            gravida euismod tellus.
          </TextDisplay>
          <TextHeading className='mt-12 text-start'>
            Visualize your COR schedule. Nam vulputate fermentum tellus id
            fringilla. Praesent gravida euismod tellus.
          </TextHeading>
          <TextBody className='mt-4 text-start'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            vulputate consequat est non finibus. Nam vulputate fermentum tellus
            id fringilla. Praesent gravida euismod tellus. Groups. Set custom
            Rules for membership, defining how and which Accounts can join.
          </TextBody>
          <div className='mt-4'>
            <Button className='mx-auto'>Get Started</Button>
          </div>
        </div>
        <div className='flex aspect-square h-[300px] flex-col rounded-xl border bg-white'>
          <div className='relative grow overflow-hidden border-b'>
            <div className='absolute top-[10%] left-[10%] aspect-video w-[500px] rounded-xl bg-[#61E002]' />
          </div>
          <div className='flex h-min flex-col gap-2 p-4'>
            <div className='flex flex-row items-center gap-2'>
              <TextBody className='font-bold'>Best app ever</TextBody>
              <div className='rounded-full bg-[#58cc02] px-1 py-1'>
                <TextSub className='text-white'>Badge</TextSub>
              </div>
            </div>
            <div className=''>
              <TextSub>
                Get the full experience. Nam vulputate fermentum tellus id
                fringilla. Praesent gravida euismod tellus.
              </TextSub>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
