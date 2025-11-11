import { cn } from '@/lib/cn'

export const textDisplayClassNames =
  'font-heading text-foreground text-[39.4px] leading-[110%] font-[850] tracking-[-0.2px]'
export const TextDisplay = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 {...props} className={cn(textDisplayClassNames, className)}>
      {children}
    </h1>
  )
}

export const textHeadingClassNames =
  'font-heading text-foreground text-[27.36px] leading-[128%] font-[750] tracking-[-0.5px]'
export const TextHeading = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 {...props} className={cn(textHeadingClassNames, className)}>
      {children}
    </h1>
  )
}

export const textBodyClassNames =
  'font-body text-foreground text-[18px] leading-[140%] font-[400] tracking-[-0.27px]'
export const TextBody = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(textBodyClassNames, className)}>
      {children}
    </p>
  )
}

export const textSubClassNames =
  'font-body text-foreground text-[12px] leading-[120%] font-[350] tracking-[0.2]'
export const TextSub = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p {...props} className={cn(textSubClassNames, className)}>
      {children}
    </p>
  )
}
