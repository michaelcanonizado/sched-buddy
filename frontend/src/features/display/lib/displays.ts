type Display = {
  name: string
  type: 'phone' | 'tablet' | 'paper' | 'custom'
  /* In pixels */
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
    name: 'A4',
    type: 'paper',
    dimensions: {
      width: 2480,
      height: 3508,
    },
  },
]

export default displays
