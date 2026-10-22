import { NextRequest, NextResponse } from 'next/server'
import { runWialonReport } from '@/lib/wialon'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const resourceId = Number(body.resourceId)
    const templateId = Number(body.templateId)
    const objectId = Number(body.objectId)
    const from = Number(body.from)
    const to = Number(body.to)
    const maxRangeSeconds = 90 * 24 * 60 * 60

    if (![resourceId, templateId, objectId, from, to].every(Number.isFinite)
      || [resourceId, templateId, objectId].some((value) => value <= 0)
      || from <= 0 || to <= from || to - from > maxRangeSeconds) {
      return NextResponse.json({ error: 'Parâmetros de relatório inválidos; o intervalo máximo é 90 dias.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, ...(await runWialonReport({ resourceId, templateId, objectId, from, to })) })
  } catch (error) {
    console.error('[Wialon] POST /api/wialon/reports:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Falha ao gerar relatório Wialon',
    }, { status: 502 })
  }
}
