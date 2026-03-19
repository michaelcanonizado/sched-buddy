export function normalizeTime({
  hours,
  minutes,
  meridiem,
}: {
  hours: number
  minutes: number
  meridiem: 'am' | 'pm'
}): number {
  if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
    throw new Error(
      `Invalid hours: ${hours}. Expected an integer from 1 to 12.`,
    )
  }

  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) {
    throw new Error(
      `Invalid minutes: ${minutes}. Expected an integer from 0 to 59.`,
    )
  }

  const normalizedHours = hours % 12
  const offset = meridiem === 'am' ? 0 : 12
  return (normalizedHours + offset) * 60 + minutes
}
