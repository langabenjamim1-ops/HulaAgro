export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanDate, cleanText, failure, getAdmin } from '@/lib/batches/server'
import {
  aliveCount, bad, insertLoss, loadOwnBatch, readNumber, recordsDbMessage, requireActive, resolveDate,
} from '@/lib/batches/records'

const COHORTS = ['layers', 'broilers'] as const
const KINDS = ['daily', 'weighing'] as const

// Lista a produção da quinta autenticada. "cohort" filtra pelo tipo de ave do lote (já não depende do texto das notas).
export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const batchId = request.nextUrl.searchParams.get('batch_id')
    const cohort = request.nextUrl.searchParams.get('cohort')
    const kind = request.nextUrl.searchParams.get('kind')
    const dateFrom = cleanDate(request.nextUrl.searchParams.get('from'))
    const page = getApiPage(request)
    const admin = getAdmin()

    let query = admin
      .from('production_records')
      .select('*')
      .eq('farm_id', farmId)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (batchId) query = query.eq('batch_id', batchId)
    if (dateFrom) query = query.gte('record_date', dateFrom)
    if (kind && (KINDS as readonly string[]).includes(kind)) query = query.eq('record_kind', kind)

    if (cohort && (COHORTS as readonly string[]).includes(cohort)) {
      const { data: batches, error: batchError } = await admin.from('batches').select('id').eq('farm_id', farmId).eq('bird_type', cohort)
      if (batchError) return bad(recordsDbMessage(batchError), 500)
      const ids = (batches || []).map((row) => row.id as string)
      if (!ids.length) return NextResponse.json([])
      query = query.in('batch_id', ids)
    }

    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    if (error) {
      console.error('[production] GET:', error)
      return bad(recordsDbMessage(error), 500)
    }
    return NextResponse.json(data || [])
  } catch (error) {
    return failure(error, 'Falha ao carregar a produção')
  }
}

// Regista postura/consumo diário ("daily") ou pesagem ("weighing") de um lote da quinta autenticada.
export async function POST(request: NextRequest) {
  try {
    const { farmId, userId } = await getAuthenticatedFarmContext()
    const body = await request.json()
    const admin = getAdmin()

    const kind = cleanText(body.record_kind)
    if (!kind || !(KINDS as readonly string[]).includes(kind)) return bad('Tipo de registo inválido.')
    const batchId = cleanText(body.batch_id)
    if (!batchId) return bad('Seleciona um lote antes de guardar.')

    const { batch, error: batchError } = await loadOwnBatch(admin, farmId, batchId)
    if (batchError) return bad(recordsDbMessage(batchError), 500)
    if (!batch) return bad('Lote não encontrado.', 404)
    const inactive = requireActive(batch)
    if (inactive) return bad(inactive)

    const { date, error: dateError } = resolveDate(body.record_date, batch)
    if (dateError) return bad(dateError)

    const alive = await aliveCount(admin, batch)
    const notes = cleanText(body.notes)
    let record: Record<string, unknown>
    let lossId: string | null = null

    if (kind === 'daily') {
      const layer = batch.bird_type === 'layers' || batch.bird_type === 'breeders'
      const eggs = readNumber(body.eggs_produced, 'Ovos recolhidos', { int: true, min: 0, max: 10_000_000 })
      const broken = readNumber(body.eggs_broken, 'Ovos partidos', { int: true, min: 0 })
      const feed = readNumber(body.feed_consumption, 'Ração (kg)', { min: 0, max: 99_999 })
      const water = readNumber(body.water_consumption, 'Água (litros)', { min: 0, max: 99_999 })
      const dead = readNumber(body.mortality_count, 'Aves mortas', { int: true, min: 0, max: 1_000_000 })
      const invalid = [eggs, broken, feed, water, dead].find((item) => item.error)
      if (invalid) return bad(invalid.error as string)

      if (layer && eggs.value === null) return bad('Indique os ovos recolhidos (use 0 se não houve postura).')
      if (!layer && (eggs.value !== null || broken.value !== null)) return bad('Este lote não é de postura: não tem ovos para registar.')
      const deaths = dead.value ?? 0
      if (!layer && feed.value === null && water.value === null && deaths === 0) return bad('Indique a ração, a água ou a mortalidade do dia.')
      if (deaths > alive) return bad(`Só existem ${alive} aves vivas neste lote.`)
      if (broken.value !== null && broken.value > (eggs.value ?? 0)) return bad('Os ovos partidos não podem ser mais do que os ovos recolhidos.')
      if (eggs.value !== null && eggs.value > alive) return bad(`Ovos recolhidos (${eggs.value}) a mais para ${alive} aves vivas. Confirme os ovos ou registe as baixas do lote.`)

      // Mortalidade → batch_losses (fonte única das aves vivas), só depois de todas as validações.
      if (deaths > 0) {
        const { loss, error: lossError } = await insertLoss(admin, {
          farmId, userId, batchId, quantity: deaths, date, cause: body.mortality_reason, notes: 'Registado na produção diária',
        })
        if (lossError || !loss) {
          console.error('[production] baixa:', lossError)
          return bad(lossError ? recordsDbMessage(lossError) : 'Não foi possível registar a mortalidade.', 500)
        }
        lossId = loss.id
      }

      record = {
        eggs_produced: eggs.value ?? 0,
        eggs_broken: broken.value,
        feed_consumption: feed.value,
        water_consumption: water.value,
        mortality_count: deaths,
        batch_loss_id: lossId,
      }
    } else {
      const weight = readNumber(body.average_weight, 'Peso médio (g)', { min: 1, max: 9999 })
      const sample = readNumber(body.sample_size, 'Aves pesadas', { int: true, min: 1 })
      const invalid = [weight, sample].find((item) => item.error)
      if (invalid) return bad(invalid.error as string)
      if (weight.value === null) return bad('Indique o peso médio em gramas.')
      if (sample.value !== null && sample.value > alive) return bad(`Só existem ${alive} aves vivas neste lote.`)
      record = { average_weight: weight.value, sample_size: sample.value }
    }

    const { data, error } = await admin
      .from('production_records')
      .insert([{ ...record, farm_id: farmId, batch_id: batchId, record_date: date, record_kind: kind, notes, created_by: userId }])
      .select()
      .single()
    if (error) {
      console.error('[production] POST:', error)
      // Desfaz a baixa para não ficar mortalidade sem registo.
      if (lossId) await admin.from('batch_losses').delete().eq('id', lossId).eq('farm_id', farmId)
      return bad(recordsDbMessage(error), 500)
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao guardar o registo de produção')
  }
}