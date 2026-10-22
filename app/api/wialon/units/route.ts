import { NextRequest, NextResponse } from 'next/server'
import { getWialonFleetData, getWialonUnits } from '@/lib/wialon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullFleet = request.nextUrl.searchParams.get('full') === '1'
    const fleet = fullFleet ? await getWialonFleetData(request.nextUrl.searchParams.get('refresh') === '1') : null
    const units = fleet?.units ?? await getWialonUnits()

    return NextResponse.json({
      ok: true,
      source: 'wialon',
      updatedAt: fleet?.updatedAt ?? new Date().toISOString(),
      units,
    })
  } catch (error) {
    console.error('[Wialon] GET /api/wialon/units:', error)

    return NextResponse.json(
      {
        ok: false,
        source: 'wialon',
        error: error instanceof Error ? error.message : 'Falha ao consultar Wialon',
        units: [],
      },
      { status: 503 }
    )
  }
}
