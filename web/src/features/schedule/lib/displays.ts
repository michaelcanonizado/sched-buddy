export type Orientation = 'portrait' | 'landscape'

export type Display = {
  name: string
  /**
   * [shortSide, longSide]
   */
  dimensions: [number, number]
  defaultOrientation: Orientation
}

export type DisplayGroup = {
  name: string
  displays: Display[]
}

export function getDisplayDimensions(
  dimensions: Display['dimensions'],
  orientation: Orientation,
): { width: number; height: number } {
  const [a, b] = dimensions

  const max = Math.max(a, b)
  const min = Math.min(a, b)

  const width = orientation === 'portrait' ? min : max
  const height = orientation === 'portrait' ? max : min

  return {
    width,
    height,
  }
}

export const displayGroups: DisplayGroup[] = [
  {
    name: 'phone',
    displays: [
      {
        name: 'iPhone SE',
        dimensions: [750, 1334],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPhone 13 / 14',
        dimensions: [1170, 2532],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPhone 14 Pro',
        dimensions: [1179, 2556],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPhone 14 Pro Max',
        dimensions: [1290, 2796],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPhone 16 Pro Max',
        dimensions: [1320, 2868],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Pixel 8',
        dimensions: [1080, 2400],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Pixel 9',
        dimensions: [1080, 2424],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy S24',
        dimensions: [1080, 2340],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy S24 Ultra',
        dimensions: [1440, 3120],
        defaultOrientation: 'portrait',
      },
    ],
  },

  {
    name: 'tablet',
    displays: [
      {
        name: 'iPad Mini',
        dimensions: [1488, 2266],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPad 10.9"',
        dimensions: [1640, 2360],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPad Air 11"',
        dimensions: [1640, 2360],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPad Pro 11"',
        dimensions: [1668, 2420],
        defaultOrientation: 'portrait',
      },
      {
        name: 'iPad Pro 13"',
        dimensions: [2064, 2752],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy Tab A9',
        dimensions: [800, 1340],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy Tab S9',
        dimensions: [1600, 2560],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy Tab S9+',
        dimensions: [1752, 2800],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Galaxy Tab S9 Ultra',
        dimensions: [1848, 2960],
        defaultOrientation: 'portrait',
      },
    ],
  },

  {
    name: 'desktop',
    displays: [
      {
        name: 'Macbook Air',
        dimensions: [1280, 832],
        defaultOrientation: 'landscape',
      },
      {
        name: 'Macbook Pro 14"',
        dimensions: [1512, 982],
        defaultOrientation: 'landscape',
      },
      {
        name: 'Macbook Pro 16"',
        dimensions: [1728, 1117],
        defaultOrientation: 'landscape',
      },
      {
        name: 'Desktop',
        dimensions: [1440, 1024],
        defaultOrientation: 'landscape',
      },
    ],
  },

  {
    name: 'paper',
    displays: [
      {
        name: 'A6',
        dimensions: [105, 148],
        defaultOrientation: 'portrait',
      },
      {
        name: 'A5',
        dimensions: [148, 210],
        defaultOrientation: 'portrait',
      },
      {
        name: 'A4',
        dimensions: [210, 297],
        defaultOrientation: 'portrait',
      },
      {
        name: 'A3',
        dimensions: [297, 420],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Letter',
        dimensions: [216, 279],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Legal',
        dimensions: [216, 356],
        defaultOrientation: 'portrait',
      },
      {
        name: 'Tabloid',
        dimensions: [279, 432],
        defaultOrientation: 'portrait',
      },
    ],
  },
]
