const BASE_URL = process.env.NEXT_PUBLIC_API_URL
export function buildBackendUrl(path: string) {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
