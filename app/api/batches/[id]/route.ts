export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { resolveFacility } from '@/lib/batches/facility'
import {
  BATCH_STATUSES, BIRD_TYPES, cleanDate, cleanText, dbErrorMessage, failure, getAdmin, lossTotals, toInt, toNumber, todayISO, withStats,
} from '@/lib/batches/server'

type Ctx = { params: Promise<{ id: string }> }

// Tabelas com registos ligados ao lote. Se existirem registos, o lote não é apagado.
const RELATED: Array<[string, string]> = [
  ['production_records', 'produção'],
  ['health_records', 'sanidade'],
  ['cost_records', 'custos'],
  ['environmental_monitoring', 'ambiente'],
  ['deviations', 'desvios'],
  ['nutrition_records', 'nutrição'],
  ['daily_management_records', 'manejo diário'],
  ['vaccination_records', 'vacinação'],
  ['flock_classifications', 'classificação do bando'],
  ['batch_losses', 'baixas'],
]

async function loadBatch(farmId: string, id: string) {
  const admin = getAdmin()
  const { data, error } = await admin.from('batches').select('*').eq('id', id).eq('farm_id', farmId).maybeSingle()
  return { admin, batch: data, error }
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const { admin, batch, error } = await loadBatch(farmId, id)
    if (error) return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 })
    if (!batch) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })
    const totals = await lossTotals(admin, [id])
    return NextResponse.json(withStats(batch, totals[id]))
  } catch (error) {
    return failure(error, 'Falha ao carregar o lote')
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()
    const { admin, batch, error: loadError } = await loadBatch(farmId, id)
    if (loadError) return NextResponse.json({ error: dbErrorMessage(loadError) }, { status: 500 })
    if (!batch) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })

    const update: Record<string, unknown> = {}
    const bad = (message: string) => NextResponse.json({ error: message }, { status: 400 })

    if ('batch_code' in body) {
      const code = cleanText(body.batch_code)
      if (!code) return bad('O código do lote não pode ficar vazio.')
      update.batch_code = code
    }
    if ('bird_type' in body) {
      const type = cleanText(body.bird_type)
      if (!type || !(BIRD_TYPES as readonly string[]).includes(type)) return bad('Tipo de ave inválido.')
      update.bird_type = type
    }
    if ('birds_count' in body) {
      const count = toInt(body.birds_count)
      if (!count || count <= 0) return bad('A quantidade de aves tem de ser um número inteiro maior que 0.')
      const totals = (await lossTotals(admin, [id]))[id]
      const lost = (totals?.mortality || 0) + (totals?.culled || 0)
      if (count < lost) return bad(`A quantidade não pode ser menor que as baixas já registadas (${lost}).`)
      update.birds_count = count
    }
    if ('status' in body) {
      const status = cleanText(body.status)
      if (!status || !(BATCH_STATUSES as readonly string[]).includes(status)) return bad('Estado inválido.')
      update.status = status
    }
    for (const key of ['genetics', 'facility_location', 'notes', 'origin_supplier', 'document_number'] as const) {
      if (key in body) update[key] = cleanText(body[key])
    }
    for (const key of ['start_date', 'end_date', 'hatch_date'] as const) {
      if (key in body) update[key] = cleanDate(body[key])
    }
    if ('ordered_count' in body) {
      const n = toInt(body.ordered_count)
      if (n !== null && n <= 0) return bad('A quantidade encomendada tem de ser maior que 0.')
      update.ordered_count = n
    }
    if ('unit_cost' in body) {
      const n = toNumber(body.unit_cost)
      if (n !== null && n < 0) return bad('O custo por ave não pode ser negativo.')
      update.unit_cost = n
    }

    // Ao terminar um lote, fixa a data de término.
    const finalStatus = (update.status ?? batch.status) as string
    const finalEnd = 'end_date' in update ? update.end_date : batch.end_date
    if ((finalStatus === 'finished' || finalStatus === 'ended') && !finalEnd) update.end_date = todayISO()
    if (finalStatus === 'active' && 'status' in update) update.end_date = null

    // Galpão do lote: só mexe se o pedido o indicar (e a coluna existir na base de dados).
    if ('facility_id' in body && (cleanText(body.facility_id) || 'facility_id' in batch)) {
      const facilityId = cleanText(body.facility_id)
      if (facilityId) {
        const lostTotals = (await lossTotals(admin, [id]))[id]
        const lostNow = (lostTotals?.mortality || 0) + (lostTotals?.culled || 0)
        const candidateAlive = Math.max(0, Number(update.birds_count ?? batch.birds_count) - lostNow)
        const resolved = await resolveFacility(admin, farmId, facilityId, candidateAlive, { excludeBatchId: id, checkCapacity: finalStatus === 'active' })
        if (resolved.error || !resolved.facility) return NextResponse.json({ error: resolved.error || 'Galpão inválido.' }, { status: resolved.status || 400 })
        update.facility_id = facilityId
        update.facility_location = resolved.facility.name
      } else {
        update.facility_id = null
      }
    }

    const start = (update.start_date ?? batch.start_date) as string
    const end = (update.end_date ?? batch.end_date) as string | null
    const hatch = ('hatch_date' in update ? update.hatch_date : batch.hatch_date) as string | null
    if (end && start && end < start) return bad('A data de término não pode ser antes da data de entrada.')
    if (hatch && start && hatch > start) return bad('A data de nascimento não pode ser depois da entrada.')

    if (!Object.keys(update).length) return bad('Nada para atualizar.')

    const { data, error } = await admin
      .from('batches')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('farm_id', farmId)
      .select()
      .maybeSingle()

    if (error) {
      console.error('[batches] PUT:', error)
      return NextResponse.json({ error: dbErrorMessage(error), code: error.code }, { status: error.code === '23505' ? 409 : 400 })
    }
    if (!data) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })
    const totals = await lossTotals(admin, [id])
    return NextResponse.json(withStats(data, totals[id]))
  } catch (error) {
    return failure(error, 'Falha ao atualizar o lote')
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const { admin, batch, error: loadError } = await loadBatch(farmId, id)
    if (loadError) return NextResponse.json({ error: dbErrorMessage(loadError) }, { status: 500 })
    if (!batch) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })

    // Apagar só é permitido se o lote não tiver nenhum registo ligado (apagar remove tudo em cascata).
    const used: string[] = []
    for (const [table, label] of RELATED) {
      const { count, error } = await admin.from(table).select('id', { count: 'exact', head: true }).eq('batch_id', id)
      if (error) {
        if (error.code === '42P01') continue // tabela ainda não existe nesta base
        console.error(`[batches] contagem em ${table}:`, error.message)
        return NextResponse.json({ error: 'Não foi possível verificar os registos do lote. Tente novamente.' }, { status: 500 })
      }
      if (count) used.push(`${label}: ${count}`)
    }
    if (used.length) {
      return NextResponse.json({
        error: `Este lote tem registos associados (${used.join(', ')}). Para não perder histórico, termine o lote em vez de o apagar.`,
        code: 'HAS_RECORDS',
      }, { status: 409 })
    }

    const { error } = await admin.from('batches').delete().eq('id', id).eq('farm_id', farmId)
    if (error) return NextResponse.json({ error: dbErrorMessage(error) }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error, 'Falha ao apagar o lote')
  }
}