export type Display = {
  name: string
  type: 'phone' | 'tablet' | 'custom'
  /* 
  Rules:
  1) Unit is in pixels
  2) Height should be greater than the width to set the initial orientation to be portrait
  */
  dimensions: {
    width: number
    height: number
  }
}

const displays: Display[] = [
  {
    name: 'iPhone 11 Pro',
    type: 'phone',
    dimensions: {
      width: 1125,
      height: 2436,
    },
  },
  {
    name: 'iPad Pro 11"',
    type: 'tablet',
    dimensions: {
      width: 834,
      height: 1194,
    },
  },
]

export default displays
