export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { LOSS_TYPES, cleanDate, cleanText, dbErrorMessage, failure, getAdmin, lossTotals, toInt, todayISO, withStats } from '@/lib/batches/server'

type Ctx = { params: Promise<{ id: string }> }

async function ownBatch(farmId: string, id: string) {
  const admin = getAdmin()
  const { data, error } = await admin.from('batches').select('*').eq('id', id).eq('farm_id', farmId).maybeSingle()
  return { admin, batch: data, error }
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const { admin, batch, error } = await ownBatch(farmId, id)
    if (error) return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 })
    if (!batch) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })

    const { data, error: lossError } = await admin
      .from('batch_losses')
      .select('*')
      .eq('batch_id', id)
      .eq('farm_id', farmId)
      .order('loss_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (lossError) return NextResponse.json({ error: dbErrorMessage(lossError) }, { status: 500 })

    const totals = await lossTotals(admin, [id])
    return NextResponse.json({ batch: withStats(batch, totals[id]), losses: data || [] })
  } catch (error) {
    return failure(error, 'Falha ao carregar as baixas')
  }
}

export async function POST(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId, userId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()
    const { admin, batch, error } = await ownBatch(farmId, id)
    if (error) return NextResponse.json({ error: dbErrorMessage(error) }, { status: 500 })
    if (!batch) return NextResponse.json({ error: 'Lote não encontrado.' }, { status: 404 })

    const bad = (message: string) => NextResponse.json({ error: message }, { status: 400 })
    const quantity = toInt(body.quantity)
    const lossType = cleanText(body.loss_type) || 'mortality'
    const lossDate = cleanDate(body.loss_date) || todayISO()

    if (!quantity || quantity <= 0) return bad('A quantidade tem de ser um número inteiro maior que 0.')
    if (!(LOSS_TYPES as readonly string[]).includes(lossType)) return bad('Tipo de baixa inválido.')
    if (lossDate < String(batch.start_date).slice(0, 10)) return bad('A data da baixa não pode ser antes da entrada do lote.')
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    if (lossDate > tomorrow) return bad('A data da baixa não pode estar no futuro.')

    const totals = await lossTotals(admin, [id])
    const current = withStats(batch, totals[id])
    if (quantity > current.alive_count) return bad(`Só existem ${current.alive_count} aves vivas neste lote.`)

    const { data, error: insertError } = await admin
      .from('batch_losses')
      .insert([{
        farm_id: farmId,
        batch_id: id,
        loss_date: lossDate,
        quantity,
        loss_type: lossType,
        cause: cleanText(body.cause),
        notes: cleanText(body.notes),
        created_by: userId,
      }])
      .select()
      .single()
    if (insertError) {
      console.error('[batches] POST losses:', insertError)
      return NextResponse.json({ error: dbErrorMessage(insertError) }, { status: 400 })
    }

    const fresh = withStats(batch, await lossTotals(admin, [id]).then((t) => t[id]))
    return NextResponse.json({ loss: data, batch: fresh }, { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao registar a baixa')
  }
}