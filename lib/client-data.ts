type CachedValue = { value: unknown; expiresAt: number }

const cache = new Map<string, CachedValue>()
const pending = new Map<string, Promise<unknown>>()
const DEFAULT_TTL_MS = 2_000
export const CLIENT_PAGE_SIZE = 50

export function pagedEndpoint(url: string, offset: number, limit = CLIENT_PAGE_SIZE) {
  const parsed = new URL(url, 'http://local.invalid')
  parsed.searchParams.set('limit', String(limit))
  parsed.searchParams.set('offset', String(offset))
  return `${parsed.pathname}${parsed.search}`
}

/** Reuses short lived GET results within this browser tab and coalesces concurrent requests. */
export async function getClientJson<T>(url: string, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const key = url
  const cached = cache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T

  const existing = pending.get(key)
  if (existing) return existing as Promise<T>

  const request = fetch(url, { cache: 'no-store' }).then(async (response) => {
    const value: unknown = await response.json()
    if (!response.ok) {
      const message = value && typeof value === 'object' && 'error' in value ? String(value.error) : 'Falha ao carregar dados.'
      throw new Error(message)
    }
    cache.set(key, { value, expiresAt: Date.now() + ttlMs })
    return value
  }).finally(() => pending.delete(key))

  pending.set(key, request)
  return request as Promise<T>
}

/** Clears matching cached GETs after a successful write. */
export function invalidateClientData(urlPrefix: string) {
  for (const key of cache.keys()) if (key.startsWith(urlPrefix)) cache.delete(key)
}
