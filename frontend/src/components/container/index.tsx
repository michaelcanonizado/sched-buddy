import { cn } from '@/lib/cn'

export default function Container({
  className,
  children,
}: ComponentClassNameAndChildrenProp) {
  return (
    <div className={cn('mx-auto w-full max-w-[1000px] px-4', className)}>
      {children}
    </div>
  )
}
