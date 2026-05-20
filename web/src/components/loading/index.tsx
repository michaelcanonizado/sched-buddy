import React from 'react'

type LoadingDotsProps = React.SVGProps<SVGSVGElement>

export default function LoadingDots(props: LoadingDotsProps) {
  return (
    <svg
      viewBox='0 0 30 10'
      xmlns='http://www.w3.org/2000/svg'
      aria-label='Loading'
      role='img'
      {...props}
    >
      {/* Red */}
      <circle fill='#d00000' cx='3' cy='5' r='2'>
        <animate attributeName='cy' values='5;2;5' dur='0.8s' repeatCount='indefinite' begin='0s' />
      </circle>

      {/* Orange */}
      <circle fill='#fb8500' cx='9' cy='5' r='2'>
        <animate
          attributeName='cy'
          values='5;2;5'
          dur='0.8s'
          repeatCount='indefinite'
          begin='0.1s'
        />
      </circle>

      {/* Green */}
      <circle fill='#70e000' cx='15' cy='5' r='2'>
        <animate
          attributeName='cy'
          values='5;2;5'
          dur='0.8s'
          repeatCount='indefinite'
          begin='0.2s'
        />
      </circle>

      {/* Blue */}
      <circle fill='#219ebc' cx='21' cy='5' r='2'>
        <animate
          attributeName='cy'
          values='5;2;5'
          dur='0.8s'
          repeatCount='indefinite'
          begin='0.3s'
        />
      </circle>

      {/* Pink */}
      <circle fill='#fe689b' cx='27' cy='5' r='2'>
        <animate
          attributeName='cy'
          values='5;2;5'
          dur='0.8s'
          repeatCount='indefinite'
          begin='0.4s'
        />
      </circle>
    </svg>
  )
}
