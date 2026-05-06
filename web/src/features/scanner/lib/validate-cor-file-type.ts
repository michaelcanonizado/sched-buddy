const fileConditions = {
  acceptedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
  maxMB: 5,
}

export function validateCORFileType(file: File): string | null {
  if (!fileConditions.acceptedTypes.includes(file.type)) {
    throw new Error('Only PNG, JPEG, and PDF files are supported.')
  }
  if (file.size > fileConditions.maxMB * 1024 * 1024) {
    throw new Error(`File must be under ${fileConditions.maxMB}MB.`)
  }
  return null
}
