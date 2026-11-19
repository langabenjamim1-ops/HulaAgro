import { getAdmin, lossTotals, withStats } from '@/lib/batches/server'

type Admin = ReturnType<typeof getAdmin>

export const FACILITY_STATUSES = ['active', 'maintenance', 'inactive'] as const

export type Facility = { id: string; farm_id: string; name: string; capacity: number | null; status: string | null }

export function facilityMigrationMessage(message: string) {
  return `Falta atualizar a base de dados dos galpões. Execute as migrações 12_galpoes_por_quinta.sql e 14_lotes_galpoes.sql no Supabase. (${message})`
}

/** Aves vivas e nº de lotes ativos por galpão (só lotes ativos ocupam o galpão). */
export async function occupancyByFacility(admin: Admin, farmId: string, facilityIds: string[], excludeBatchId?: string) {
  const result: Record<string, { alive: number; batches: number }> = {}
  if (!facilityIds.length) return { result }
  let query = admin.from('batches').select('id, birds_count, facility_id').eq('farm_id', farmId).eq('status', 'active').in('facility_id', facilityIds)
  if (excludeBatchId) query = query.neq('id', excludeBatchId)
  const { data, error } = await query
  if (error) return { result, error }
  const rows = (data || []) as Array<{ id: string; birds_count: number; facility_id: string }>
  const totals = await lossTotals(admin, rows.map((row) => row.id))
  for (const row of rows) {
    const alive = withStats(row, totals[row.id]).alive_count
    const entry = (result[row.facility_id] ||= { alive: 0, batches: 0 })
    entry.alive += alive
    entry.batches += 1
  }
  return { result }
}

/** Confirma que o galpão é da quinta, está disponível e tem espaço para as aves do lote. */
export async function resolveFacility(admin: Admin, farmId: string, facilityId: string, candidateAlive: number, opts: { excludeBatchId?: string; checkCapacity?: boolean } = {}): Promise<{ facility?: Facility; error?: string; status?: number }> {
  const { data, error } = await admin.from('facilities').select('id, farm_id, name, capacity, status').eq('id', facilityId).eq('farm_id', farmId).maybeSingle()
  if (error) return { error: error.code === '42703' || error.code === '42P01' ? facilityMigrationMessage(error.message) : error.message, status: 500 }
  const facility = data as Facility | null
  if (!facility) return { error: 'Galpão não encontrado.', status: 404 }
  if (facility.status === 'inactive') return { error: `O galpão «${facility.name}» está inativo.`, status: 400 }

  if (opts.checkCapacity !== false && facility.capacity !== null && facility.capacity !== undefined) {
    const { result, error: occError } = await occupancyByFacility(admin, farmId, [facility.id], opts.excludeBatchId)
    if (occError) return { error: occError.code === '42703' ? facilityMigrationMessage(occError.message) : occError.message, status: 500 }
    const current = result[facility.id]?.alive ?? 0
    if (current + candidateAlive > facility.capacity) {
      return { error: `O galpão «${facility.name}» tem capacidade para ${facility.capacity} aves e já tem ${current}. Com este lote ficaria com ${current + candidateAlive}.`, status: 400 }
    }
  }
  return { facility }
}