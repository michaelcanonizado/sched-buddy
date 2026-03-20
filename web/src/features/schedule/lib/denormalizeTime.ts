export function denormalizeTime(minutesAfterMidnight: number): {
  hours: number
  minutes: number
  meridiem: 'am' | 'pm'
} {
  if (
    !Number.isInteger(minutesAfterMidnight) ||
    minutesAfterMidnight < 0 ||
    minutesAfterMidnight >= 24 * 60
  ) {
    throw new Error(
      `Invalid totalMinutes: ${minutesAfterMidnight}. Expected an integer from 0 to 1439.`,
    )
  }

  const hours24 = Math.floor(minutesAfterMidnight / 60)
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  return {
    hours: hours12,
    minutes: minutesAfterMidnight % 60,
    meridiem: hours24 < 12 ? 'am' : 'pm',
  }
}
