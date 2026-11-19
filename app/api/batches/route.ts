export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { resolveFacility } from '@/lib/batches/facility'
import {
  BIRD_TYPES, cleanDate, cleanText, dbErrorMessage, failure, getAdmin, lossTotals, toInt, toNumber, withStats,
} from '@/lib/batches/server'

export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const summary = request.nextUrl.searchParams.get('summary') === '1'
    const page = getApiPage(request)
    const admin = getAdmin()

    let query = admin
      .from('batches')
      .select(summary ? 'id,status,birds_count' : '*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)

    const { data, error } = await query
    if (error) {
      console.error('[batches] GET:', error)
      return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 })
    }

    const rows = (data || []) as unknown as Array<{ id: string; birds_count: number }>
    if (summary) return NextResponse.json(rows)

    const totals = await lossTotals(admin, rows.map((row) => row.id))
    return NextResponse.json(rows.map((row) => withStats(row as never, totals[row.id])))
  } catch (error) {
    return failure(error, 'Falha ao carregar lotes')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const body = await request.json()

    const batchCode = cleanText(body.batch_code)
    const birdType = cleanText(body.bird_type)
    const birdsCount = toInt(body.birds_count)
    const startDate = cleanDate(body.start_date)
    const hatchDate = cleanDate(body.hatch_date)
    const orderedCount = toInt(body.ordered_count)
    const unitCost = toNumber(body.unit_cost)

    if (!batchCode) return NextResponse.json({ error: 'Indique o código do lote.' }, { status: 400 })
    if (!birdType || !(BIRD_TYPES as readonly string[]).includes(birdType)) return NextResponse.json({ error: 'Tipo de ave inválido.' }, { status: 400 })
    if (!birdsCount || birdsCount <= 0) return NextResponse.json({ error: 'A quantidade de aves tem de ser um número inteiro maior que 0.' }, { status: 400 })
    if (!startDate) return NextResponse.json({ error: 'Indique a data de entrada.' }, { status: 400 })
    if (hatchDate && hatchDate > startDate) return NextResponse.json({ error: 'A data de nascimento não pode ser depois da entrada.' }, { status: 400 })
    if (orderedCount !== null && orderedCount <= 0) return NextResponse.json({ error: 'A quantidade encomendada tem de ser maior que 0.' }, { status: 400 })
    if (unitCost !== null && unitCost < 0) return NextResponse.json({ error: 'O custo por ave não pode ser negativo.' }, { status: 400 })

    const admin = getAdmin()
    const facilityId = cleanText(body.facility_id)
    let facilityName: string | null = null
    if (facilityId) {
      const resolved = await resolveFacility(admin, farmId, facilityId, birdsCount)
      if (resolved.error || !resolved.facility) return NextResponse.json({ error: resolved.error || 'Galpão inválido.' }, { status: resolved.status || 400 })
      facilityName = resolved.facility.name
    }

    const record = {
      farm_id: farmId,
      batch_code: batchCode,
      bird_type: birdType,
      birds_count: birdsCount,
      genetics: cleanText(body.genetics),
      facility_location: facilityName ?? cleanText(body.facility_location),
      ...(facilityId ? { facility_id: facilityId } : {}),
      start_date: startDate,
      status: 'active',
      notes: cleanText(body.notes),
      origin_supplier: cleanText(body.origin_supplier),
      hatch_date: hatchDate,
      document_number: cleanText(body.document_number),
      ordered_count: orderedCount,
      unit_cost: unitCost,
    }

    const { data, error } = await admin.from('batches').insert([record]).select().single()
    if (error) {
      console.error('[batches] POST:', error)
      const status = error.code === '23505' ? 409 : 400
      return NextResponse.json({ error: dbErrorMessage(error), code: error.code }, { status })
    }
    return NextResponse.json(withStats(data), { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao criar lote')
  }
}