export const DEFAULT_MEETING_COLORS = [
  '#00A5E3',
  '#8DD7BF',
  '#FF96C5',
  '#FF5768',
  '#FFBF65',
  '#FC6238',
  '#FFD872',
  '#F2D4CC',
  '#E77577',
  '#6C88C4',
  '#FF828B',
  '#E7C582',
  '#00B0BA',
  '#FF6F68',
  '#FFDACC',
  '#FF60A8',
]

export function createUniqueColorGenerator(colorArray = DEFAULT_MEETING_COLORS) {
  const available = [...colorArray]

  return function getRandomColor() {
    if (available.length === 0) return null

    const index = Math.floor(Math.random() * available.length)
    return available.splice(index, 1)[0]
  }
}
