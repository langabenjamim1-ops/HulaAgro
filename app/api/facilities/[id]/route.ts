export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanDate, cleanText, failure, getAdmin } from '@/lib/batches/server'
import { bad, readNumber, recordsDbMessage } from '@/lib/batches/records'
import { FACILITY_STATUSES, facilityMigrationMessage, occupancyByFacility } from '@/lib/batches/facility'

type Ctx = { params: Promise<{ id: string }> }

function dbMessage(error: { code?: string; message: string }) {
  if (error.code === '42703' || error.code === '42P01') return facilityMigrationMessage(error.message)
  return recordsDbMessage(error)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()
    const admin = getAdmin()

    const { data: current, error: loadError } = await admin.from('facilities').select('id, name').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (loadError) return bad(dbMessage(loadError), 500)
    if (!current) return bad('Galpão não encontrado.', 404)

    const update: Record<string, unknown> = {}
    if ('name' in body) {
      const name = cleanText(body.name)
      if (!name) return bad('O nome do galpão não pode ficar vazio.')
      update.name = name
    }
    if ('capacity' in body) {
      const capacity = readNumber(body.capacity, 'Capacidade', { int: true, min: 1, max: 10_000_000 })
      if (capacity.error) return bad(capacity.error)
      if (capacity.value !== null) {
        const { result } = await occupancyByFacility(admin, farmId, [id])
        const occupied = result[id]?.alive ?? 0
        if (capacity.value < occupied) return bad(`A capacidade não pode ser menor que as aves vivas que já estão neste galpão (${occupied}).`)
      }
      update.capacity = capacity.value
    }
    if ('status' in body) {
      const status = cleanText(body.status)
      if (!status || !(FACILITY_STATUSES as readonly string[]).includes(status)) return bad('Estado inválido.')
      update.status = status
    }
    if ('facility_type' in body) update.facility_type = cleanText(body.facility_type)
    if ('notes' in body) update.notes = cleanText(body.notes)
    if ('last_maintenance' in body) update.last_maintenance = cleanDate(body.last_maintenance)
    if ('construction_date' in body) update.construction_date = cleanDate(body.construction_date)
    if (!Object.keys(update).length) return bad('Nada para atualizar.')

    const { data, error } = await admin.from('facilities').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id).eq('farm_id', farmId).select().single()
    if (error) return bad(dbMessage(error), 500)

    // Mantém o texto do local dos lotes em sincronia com o novo nome.
    if (update.name && update.name !== current.name) {
      await admin.from('batches').update({ facility_location: update.name }).eq('facility_id', id).eq('farm_id', farmId)
    }
    return NextResponse.json(data)
  } catch (error) {
    return failure(error, 'Falha ao atualizar o galpão')
  }
}

// Só apaga galpões sem lotes (ativos ou terminados) para não perder o histórico.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const admin = getAdmin()

    const { count, error: countError } = await admin.from('batches').select('id', { count: 'exact', head: true }).eq('farm_id', farmId).eq('facility_id', id)
    if (countError) return bad(dbMessage(countError), 500)
    if ((count ?? 0) > 0) return bad(`Este galpão tem ${count} lote(s) associado(s). Mude esses lotes de galpão antes de o apagar, ou marque o galpão como inativo.`, 409)

    const { data, error } = await admin.from('facilities').delete().eq('id', id).eq('farm_id', farmId).select('id')
    if (error) return bad(dbMessage(error), 500)
    if (!data?.length) return bad('Galpão não encontrado.', 404)
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error, 'Falha ao apagar o galpão')
  }
}