import { TimeFormValue } from '../components/subject-form'

export function normalizeTime({ hours, minutes, meridiem }: TimeFormValue): number {
  if (hours === undefined) {
    throw new Error(`Normalizing time with undefined hours: `)
  }
  if (minutes === undefined) {
    throw new Error(`Normalizing time with undefined hours: `)
  }

  if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
    throw new Error(`Invalid hours: ${hours}. Expected an integer from 1 to 12.`)
  }

  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Expected an integer from 0 to 59.`)
  }

  const normalizedHours = hours % 12
  const offset = meridiem === 'AM' ? 0 : 12
  return (normalizedHours + offset) * 60 + minutes
}
