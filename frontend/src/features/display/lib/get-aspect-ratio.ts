export function getAspectRatio(
  width: number,
  height: number,
): { antecedent: number; consequent: number } {
  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive numbers.')
  }

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)

  const ratioWidth = width / divisor
  const ratioHeight = height / divisor

  return {
    antecedent: ratioWidth,
    consequent: ratioHeight,
  }
}
