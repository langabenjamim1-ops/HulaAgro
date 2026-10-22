import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getWialonFleetData } from '@/lib/wialon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get('refresh') === '1'
    return NextResponse.json({ ok: true, ...(await getWialonFleetData(refresh)) })
  } catch (error) {
    console.error('[Wialon] GET /api/wialon/fleet:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao consultar Wialon',
    }, { status: 503 })
  }
}
