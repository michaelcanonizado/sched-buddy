import { cn } from '@/lib/utils'
import { ComponentClassNameAndChildrenProp } from '@/types'

/*
Minor Third is used
*/

export const textDisplayClassNames =
  'font-heading text-[41px] leading-[110%] font-[700] tracking-[-2.5%]'
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

export const textHeadingLGClassNames =
  'font-heading text-[32px] leading-[120%] font-[700] tracking-[-2.0%]'
export const TextHeadingLG = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 {...props} className={cn(textHeadingLGClassNames, className)}>
      {children}
    </h2>
  )
}

export const textHeadingMDClassNames =
  'font-heading text-[23px] leading-[120%] font-[600] tracking-[-1.25%]'
export const TextHeadingMD = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 {...props} className={cn(textHeadingMDClassNames, className)}>
      {children}
    </h3>
  )
}

export const textHeadingSMClassNames =
  'font-heading text-[20px] leading-[120%] font-[500] tracking-[-0.5%]'
export const TextHeadingSM = ({
  className,
  children,
  ...props
}: ComponentClassNameAndChildrenProp &
  React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h4 {...props} className={cn(textHeadingSMClassNames, className)}>
      {children}
    </h4>
  )
}

export const textBodyClassNames =
  'font-body text-[16px] leading-[147%] font-[400] tracking-[1.5%]'
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
  'font-body text-[14px] leading-[141%] font-[500] tracking-[2.25%]'
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
