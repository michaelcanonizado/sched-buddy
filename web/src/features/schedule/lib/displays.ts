export type Display = {
  name: string
  type: 'phone' | 'tablet' | 'custom'
  /* 
  Rules:
  1) Unit is in pixels
  2) Portrait and landscape is determined if height is greater than width
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
    name: 'iPhone 11 Pro (Landscape)',
    type: 'phone',
    dimensions: {
      width: 2436,
      height: 1125,
    },
  },

  {
    name: 'iPhone 14',
    type: 'phone',
    dimensions: {
      width: 1170,
      height: 2532,
    },
  },
  {
    name: 'iPhone 14 (Landscape)',
    type: 'phone',
    dimensions: {
      width: 2532,
      height: 1170,
    },
  },

  {
    name: 'iPhone 15 Pro Max',
    type: 'phone',
    dimensions: {
      width: 1290,
      height: 2796,
    },
  },
  {
    name: 'iPhone 15 Pro Max (Landscape)',
    type: 'phone',
    dimensions: {
      width: 2796,
      height: 1290,
    },
  },

  {
    name: 'Pixel 7',
    type: 'phone',
    dimensions: {
      width: 1080,
      height: 2400,
    },
  },
  {
    name: 'Pixel 7 (Landscape)',
    type: 'phone',
    dimensions: {
      width: 2400,
      height: 1080,
    },
  },

  {
    name: 'Samsung Galaxy S23',
    type: 'phone',
    dimensions: {
      width: 1080,
      height: 2340,
    },
  },
  {
    name: 'Samsung Galaxy S23 (Landscape)',
    type: 'phone',
    dimensions: {
      width: 2340,
      height: 1080,
    },
  },

  {
    name: 'iPad Mini',
    type: 'tablet',
    dimensions: {
      width: 1488,
      height: 2266,
    },
  },
  {
    name: 'iPad Mini (Landscape)',
    type: 'tablet',
    dimensions: {
      width: 2266,
      height: 1488,
    },
  },

  {
    name: 'iPad Air',
    type: 'tablet',
    dimensions: {
      width: 1640,
      height: 2360,
    },
  },
  {
    name: 'iPad Air (Landscape)',
    type: 'tablet',
    dimensions: {
      width: 2360,
      height: 1640,
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
  {
    name: 'iPad Pro 11" (Landscape)',
    type: 'tablet',
    dimensions: {
      width: 1194,
      height: 834,
    },
  },

  {
    name: 'iPad Pro 12.9"',
    type: 'tablet',
    dimensions: {
      width: 2048,
      height: 2732,
    },
  },
  {
    name: 'iPad Pro 12.9" (Landscape)',
    type: 'tablet',
    dimensions: {
      width: 2732,
      height: 2048,
    },
  },

  {
    name: 'Surface Pro 9',
    type: 'tablet',
    dimensions: {
      width: 1920,
      height: 1280,
    },
  },
  {
    name: 'Surface Pro 9 (Landscape)',
    type: 'tablet',
    dimensions: {
      width: 1280,
      height: 1920,
    },
  },
]

export default displays
