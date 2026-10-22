import { NextRequest } from 'next/server'

export type ApiPage = { limit: number; offset: number }

/** Pagination is opt-in so older clients keep their existing response shape. */
export function getApiPage(request: NextRequest, defaultLimit = 50): ApiPage | null {
  const rawLimit = request.nextUrl.searchParams.get('limit')
  if (rawLimit === null) return null
  const parsedLimit = Number.parseInt(rawLimit, 10)
  const limit = Number.isFinite(parsedLimit) ? Math.min(100, Math.max(1, parsedLimit)) : defaultLimit
  const parsedOffset = Number.parseInt(request.nextUrl.searchParams.get('offset') ?? '0', 10)
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, Math.min(1_000_000, parsedOffset)) : 0
  return { limit, offset }
}
