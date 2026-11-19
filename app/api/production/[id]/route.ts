export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanText, failure, getAdmin } from '@/lib/batches/server'
import { bad, readNumber, recordsDbMessage } from '@/lib/batches/records'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const { data, error } = await getAdmin().from('production_records').select('*').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (error) return bad(recordsDbMessage(error), 500)
    if (!data) return bad('Registo não encontrado.', 404)
    return NextResponse.json(data)
  } catch (error) {
    return failure(error, 'Falha ao carregar o registo')
  }
}

// Corrige apenas valores e observações. Quinta, lote, data e tipo não se alteram.
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()
    const admin = getAdmin()

    const { data: current, error: loadError } = await admin.from('production_records').select('id, eggs_produced, eggs_broken').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (loadError) return bad(recordsDbMessage(loadError), 500)
    if (!current) return bad('Registo não encontrado.', 404)

    const parsed = {
      eggs_produced: readNumber(body.eggs_produced, 'Ovos recolhidos', { int: true, min: 0 }),
      eggs_broken: readNumber(body.eggs_broken, 'Ovos partidos', { int: true, min: 0 }),
      feed_consumption: readNumber(body.feed_consumption, 'Ração (kg)', { min: 0, max: 99_999 }),
      water_consumption: readNumber(body.water_consumption, 'Água (litros)', { min: 0, max: 99_999 }),
      average_weight: readNumber(body.average_weight, 'Peso médio (g)', { min: 1, max: 9999 }),
      sample_size: readNumber(body.sample_size, 'Aves pesadas', { int: true, min: 1 }),
    }
    const invalid = Object.values(parsed).find((item) => item.error)
    if (invalid) return bad(invalid.error as string)

    const update: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(parsed)) if (key in body && item.value !== null) update[key] = item.value
    if ('notes' in body) update.notes = cleanText(body.notes)
    if (!Object.keys(update).length) return bad('Nada para atualizar.')

    const eggs = Number(update.eggs_produced ?? current.eggs_produced ?? 0)
    const broken = Number(update.eggs_broken ?? current.eggs_broken ?? 0)
    if (broken > eggs) return bad('Os ovos partidos não podem ser mais do que os ovos recolhidos.')

    const { data, error } = await admin.from('production_records').update(update).eq('id', id).eq('farm_id', farmId).select().single()
    if (error) return bad(recordsDbMessage(error), 500)
    return NextResponse.json(data)
  } catch (error) {
    return failure(error, 'Falha ao atualizar o registo')
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const admin = getAdmin()
    const { data: current, error: loadError } = await admin.from('production_records').select('id, batch_loss_id').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (loadError) return bad(recordsDbMessage(loadError), 500)
    if (!current) return bad('Registo não encontrado.', 404)

    const { error } = await admin.from('production_records').delete().eq('id', id).eq('farm_id', farmId)
    if (error) return bad(recordsDbMessage(error), 500)
    // Se o registo tinha mortalidade, devolve essas aves ao lote.
    if (current.batch_loss_id) await admin.from('batch_losses').delete().eq('id', current.batch_loss_id).eq('farm_id', farmId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error, 'Falha ao apagar o registo')
  }
}