import WidthContainer from '@/components/container'
import {
  TextBody,
  TextDisplay,
  TextHeadingLG,
  TextHeadingMD,
  TextHeadingSM,
  TextSub,
} from '@/components/text'

function Hero() {
  return (
    <div className='grid min-h-[750px] w-full place-items-center border-b pb-16'>
      <div className='flex max-w-[450px] flex-col items-center gap-4 *:text-center'>
        <TextDisplay>Sched Buddy Design System</TextDisplay>
        <TextHeadingSM>
          Upload your COR and get a clean, editable weekly schedule in seconds.
        </TextHeadingSM>
      </div>
    </div>
  )
}

function Typescale() {
  return (
    <div className='w-full rounded border-b py-16'>
      <div className='flex flex-col gap-8 *:text-center'>
        <TextDisplay>Display</TextDisplay>
        <TextHeadingLG>Heading Large</TextHeadingLG>
        <TextHeadingMD>Heading Medium</TextHeadingMD>
        <TextHeadingSM>Heading Small</TextHeadingSM>
        <TextBody>Body</TextBody>
        <TextSub>Sub</TextSub>
      </div>
    </div>
  )
}

function TyposcaleUsage() {
  return (
    <div className='flex flex-col gap-16 border-b py-16'>
      <div className='flex flex-col items-center gap-8'>
        <div className='rounded-full bg-gray-500 px-[8px] py-[1px]'>
          <TextSub className='text-background'>Typography Usage</TextSub>
        </div>
        <div className='flex flex-col gap-8 *:text-center'>
          <TextDisplay>Building Blocks for the Web</TextDisplay>
          <TextHeadingSM className='max-w-[600px]'>
            Clean, modern building blocks. Copy and paste into your apps. Works
            with all React frameworks. Open Source. Free forever.
          </TextHeadingSM>
        </div>
        <div className='flex gap-8'>
          <div className='bg-foreground rounded-md px-4 py-2'>
            <TextBody className='text-background'>Browse Blocks</TextBody>
          </div>
          <div className='rounded-md border px-4 py-2'>
            <TextBody>View Components</TextBody>
          </div>
        </div>
      </div>
      <div className='flex flex-col items-center gap-8'>
        <TextHeadingLG className='max-w-[300px] text-center'>
          Send, receive, swap. All in one place.
        </TextHeadingLG>
        <div className='flex w-full flex-row flex-wrap justify-between gap-8'>
          <div className='flex w-[450px] flex-col gap-2'>
            <TextHeadingMD>Send & Receive</TextHeadingMD>
            <TextBody>
              Flawless essentials. Easily send tokens and collectibles with the
              fewest taps, or share your wallet address by simply scanning a
              personalized QR code to receive new assets.
            </TextBody>
          </div>
          <div className='flex w-[450px] flex-col gap-2'>
            <TextHeadingMD>Decentralized Swaps</TextHeadingMD>
            <TextBody>
              Trade thousands of tokens with minimal fees, 24/7. Family ensures
              optimal prices from various exchanges so you can acquire the
              tokens you want, whenever you want them.
            </TextBody>
          </div>
          <div className='flex w-[450px] flex-col gap-2'>
            <TextHeadingMD>Send & Receive</TextHeadingMD>
            <TextBody>
              Flawless essentials. Easily send tokens and collectibles with the
              fewest taps, or share your wallet address by simply scanning a
              personalized QR code to receive new assets.
            </TextBody>
          </div>
          <div className='flex w-[450px] flex-col gap-2'>
            <TextHeadingMD>Decentralized Swaps</TextHeadingMD>
            <TextBody>
              Trade thousands of tokens with minimal fees, 24/7. Family ensures
              optimal prices from various exchanges so you can acquire the
              tokens you want, whenever you want them.
            </TextBody>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DesignPage() {
  return (
    <div className='mb-[200px] flex min-h-screen w-screen flex-col'>
      <Hero />
      <WidthContainer className='flex flex-col'>
        <Typescale />
        <TyposcaleUsage />
      </WidthContainer>
    </div>
  )
}
