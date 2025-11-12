import Container from '@/components/container'
import { TextHeading, TextSub } from '@/components/text'
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className='border-border bg-background border-b-2 border-dashed py-8'>
      <Container>
        <div className='flex flex-row items-center justify-between'>
          <Link href='/'>
            <div className='flex flex-row items-center gap-1'>
              <div className='size-[20px] rounded-full bg-orange-500' />
              <TextHeading className='text-[18px]'>Sched Buddy</TextHeading>
            </div>
          </Link>

          <div className='flex flex-row gap-4'>
            <TextSub>Link 1</TextSub>
            <TextSub>Link 2</TextSub>
            <TextSub>Link 3</TextSub>
          </div>
        </div>
      </Container>
    </nav>
  )
}
