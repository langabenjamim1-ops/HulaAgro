import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const OSIRIS_REGIONS = new Set(['florida', 'africa-live', 'middle-east', 'asia'])

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region') || 'florida'
  if (!OSIRIS_REGIONS.has(region)) {
    return NextResponse.json({ error: 'Região de câmaras inválida.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`https://osirisai.live/api/cctv?region=${encodeURIComponent(region)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(45000),
    })
    if (!upstream.ok) {
      return NextResponse.json({ error: `Osiris respondeu com HTTP ${upstream.status}.` }, { status: 502 })
    }

    const payload = await upstream.json()
    if (!Array.isArray(payload?.cameras)) {
      return NextResponse.json({ error: 'A resposta do Osiris não contém uma lista de câmaras válida.' }, { status: 502 })
    }

    return NextResponse.json({
      cameras: payload.cameras,
      total: Number(payload.total) || payload.cameras.length,
      region,
      updatedAt: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'private, max-age=60' } })
  } catch (cause) {
    console.error('[OSIRIS CCTV] Failed to load camera catalogue:', cause)
    return NextResponse.json({ error: 'Não foi possível obter a lista de câmaras do Osiris. Verifica a ligação à internet e tenta novamente.' }, { status: 502 })
  }
}
