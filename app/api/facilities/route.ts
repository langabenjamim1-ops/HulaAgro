export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanDate, cleanText, failure, getAdmin } from '@/lib/batches/server'
import { bad, readNumber, recordsDbMessage } from '@/lib/batches/records'
import { occupancyByFacility } from '@/lib/batches/facility'

function facilitiesDbMessage(error: { code?: string; message: string }) {
  if (error.code === '42703' || error.code === '42P01') return `A tabela de galpões ainda não está atualizada. Execute a migração 12_galpoes_por_quinta.sql no Supabase. (${error.message})`
  return recordsDbMessage(error)
}

// Lista só os galpões da quinta autenticada.
export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const facilityType = request.nextUrl.searchParams.get('type')
    const status = request.nextUrl.searchParams.get('status')
    const page = getApiPage(request)

    const admin = getAdmin()
    let query = admin.from('facilities').select('*').eq('farm_id', farmId).order('created_at', { ascending: false })
    if (facilityType) query = query.eq('facility_type', facilityType)
    if (status) query = query.eq('status', status)
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)

    const { data, error } = await query
    if (error) {
      console.error('[facilities] GET:', error)
      return bad(facilitiesDbMessage(error), 500)
    }
    const rows = (data || []) as Array<{ id: string }>

    // Junta a ocupação (aves vivas e lotes ativos) a cada galpão.
    const { result: occupancy, error: occError } = await occupancyByFacility(admin, farmId, rows.map((row) => row.id))
    if (occError) {
      console.error('[facilities] ocupação:', occError)
      return bad(facilitiesDbMessage(occError), 500)
    }
    return NextResponse.json(rows.map((row) => ({
      ...row,
      occupied: occupancy[row.id]?.alive ?? 0,
      active_batches: occupancy[row.id]?.batches ?? 0,
    })))
  } catch (error) {
    return failure(error, 'Falha ao carregar os galpões')
  }
}

// Cria um galpão na quinta autenticada (a quinta vem da sessão, nunca do pedido).
export async function POST(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const body = await request.json()

    const name = cleanText(body.name)
    if (!name) return bad('Indique o nome do galpão.')
    const capacity = readNumber(body.capacity, 'Capacidade', { int: true, min: 0, max: 10_000_000 })
    if (capacity.error) return bad(capacity.error)

    const { data, error } = await getAdmin()
      .from('facilities')
      .insert([{
        farm_id: farmId,
        name,
        facility_type: cleanText(body.facility_type),
        capacity: capacity.value,
        construction_date: cleanDate(body.construction_date),
        last_maintenance: cleanDate(body.last_maintenance),
        status: cleanText(body.status) || 'active',
        notes: cleanText(body.notes),
      }])
      .select()
      .single()
    if (error) {
      console.error('[facilities] POST:', error)
      return bad(facilitiesDbMessage(error), 500)
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao criar o galpão')
  }
}