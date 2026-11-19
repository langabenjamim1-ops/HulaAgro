export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanDate, cleanText, failure, getAdmin } from '@/lib/batches/server'
import {
  aliveCount, bad, insertLoss, loadOwnBatch, readNumber, recordsDbMessage, requireActive, resolveDate,
} from '@/lib/batches/records'

// Lista os registos de manejo da quinta autenticada. Erros aparecem como erros (já não devolve lista vazia sem avisar).
export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const batchId = request.nextUrl.searchParams.get('batch_id')
    const facilityId = request.nextUrl.searchParams.get('facility_id')
    const dateFrom = cleanDate(request.nextUrl.searchParams.get('from'))
    const page = getApiPage(request)

    let query = getAdmin()
      .from('daily_management_records')
      .select('*')
      .eq('farm_id', farmId)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (batchId) query = query.eq('batch_id', batchId)
    if (facilityId) query = query.eq('facility_id', facilityId)
    if (dateFrom) query = query.gte('record_date', dateFrom)
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)

    const { data, error } = await query
    if (error) {
      console.error('[daily-management] GET:', error)
      return bad(recordsDbMessage(error), 500)
    }
    return NextResponse.json(data || [])
  } catch (error) {
    return failure(error, 'Falha ao carregar os registos de manejo')
  }
}

// Grava o registo de manejo. A mortalidade é gravada em batch_losses (aves vivas do lote) e o registo fica ligado a essa baixa.
export async function POST(request: NextRequest) {
  try {
    const { farmId, userId } = await getAuthenticatedFarmContext()
    const body = await request.json()
    const admin = getAdmin()

    const batchId = cleanText(body.batch_id)
    if (!batchId) return bad('Seleciona um lote antes de guardar.')

    const { batch, error: batchError } = await loadOwnBatch(admin, farmId, batchId)
    if (batchError) return bad(recordsDbMessage(batchError), 500)
    if (!batch) return bad('Lote não encontrado.', 404)
    const inactive = requireActive(batch)
    if (inactive) return bad(inactive)

    const { date, error: dateError } = resolveDate(body.record_date, batch)
    if (dateError) return bad(dateError)

    const mortality = readNumber(body.mortality_count, 'Aves mortas', { int: true, min: 0, max: 1_000_000 })
    const water = readNumber(body.water_consumption_liters, 'Consumo de água', { min: 0, max: 99_999_999 })
    const weight = readNumber(body.average_weight_grams, 'Peso médio', { min: 1, max: 999_999 })
    const uniformity = readNumber(body.weight_uniformity, 'Uniformidade', { min: 0, max: 100 })
    const invalid = [mortality, water, weight, uniformity].find((item) => item.error)
    if (invalid) return bad(invalid.error as string)

    const record = {
      farm_id: farmId,
      batch_id: batchId,
      record_date: date,
      mortality_count: mortality.value,
      mortality_reason: cleanText(body.mortality_reason),
      water_consumption_liters: water.value,
      water_quality_status: cleanText(body.water_quality_status),
      average_weight_grams: weight.value,
      weight_uniformity: uniformity.value,
      bird_activity: cleanText(body.bird_activity),
      feed_consumption_status: cleanText(body.feed_consumption_status),
      notes: cleanText(body.notes),
      created_by: userId,
    }

    const hasContent = Object.entries(record).some(([key, value]) =>
      !['farm_id', 'batch_id', 'record_date', 'created_by'].includes(key) && value !== null && value !== 0)
    if (!hasContent) return bad('Preencha pelo menos um campo antes de guardar.')

    // 1) Mortalidade → batch_losses (só depois de confirmar que há aves vivas suficientes)
    let lossId: string | null = null
    const dead = mortality.value ?? 0
    if (dead > 0) {
      const alive = await aliveCount(admin, batch)
      if (dead > alive) return bad(`Só existem ${alive} aves vivas neste lote.`)
      const { loss, error: lossError } = await insertLoss(admin, {
        farmId, userId, batchId, quantity: dead, date, cause: body.mortality_reason, notes: 'Registado no manejo diário',
      })
      if (lossError || !loss) {
        console.error('[daily-management] baixa:', lossError)
        return bad(lossError ? recordsDbMessage(lossError) : 'Não foi possível registar a mortalidade.', 500)
      }
      lossId = loss.id
    }

    // 2) Registo de manejo, ligado à baixa
    const { data, error } = await admin
      .from('daily_management_records')
      .insert([{ ...record, batch_loss_id: lossId }])
      .select()
      .single()
    if (error) {
      console.error('[daily-management] POST:', error)
      // Desfaz a baixa para não ficar mortalidade sem registo de manejo.
      if (lossId) await admin.from('batch_losses').delete().eq('id', lossId).eq('farm_id', farmId)
      return bad(recordsDbMessage(error), 500)
    }

    const alive = await aliveCount(admin, batch)
    return NextResponse.json({ ...data, alive_count: alive }, { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao guardar o registo de manejo')
  }
}