import { buildBackendUrl } from '@/lib/build-backend-url'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)

  /* Only set JSON content type if body is NOT FormData */
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(buildBackendUrl(path), {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({
      detail: res.statusText,
    }))
    throw new ApiError(res.status, body.detail ?? 'Unknown error')
  }

  return res
}

export function apiGET(path: string, init?: HeadersInit) {
  return apiRequest(path, { method: 'GET', headers: init })
}

export function apiPOST(path: string, body?: unknown, init?: RequestInit) {
  const isFormData = body instanceof FormData

  return apiRequest(path, {
    ...init,
    method: 'POST',
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })
}

export function apiPUT(path: string, body?: unknown, init?: RequestInit) {
  return apiRequest(path, {
    ...init,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiPATCH(path: string, body?: unknown, init?: RequestInit) {
  return apiRequest(path, {
    ...init,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function apiDELETE(path: string, init?: RequestInit) {
  return apiRequest(path, {
    ...init,
    method: 'DELETE',
  })
}
