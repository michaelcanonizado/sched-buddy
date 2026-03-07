import { Day } from './mock-data'

export default function formatDay(
  day: Day,
  casing: 'title' | 'lower' | 'upper',
  abbreviated: boolean,
) {
  let result = day as string

  if (abbreviated) {
    result = result.slice(0, 3)
  }

  switch (casing) {
    case 'upper':
      return result.toUpperCase()
    case 'lower':
      return result.toLowerCase()
    case 'title':
      return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()
  }
}
