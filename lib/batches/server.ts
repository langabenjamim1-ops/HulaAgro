import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const BIRD_TYPES = ['layers', 'broilers', 'breeders'] as const
export const BATCH_STATUSES = ['active', 'finished', 'ended'] as const
export const LOSS_TYPES = ['mortality', 'culled'] as const

/** Cliente com chave de serviço. Usar APENAS em rotas de servidor, depois de autenticar o utilizador. */
export function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Dias entre duas datas (YYYY-MM-DD). Sem `to`, usa hoje. */
export function ageInDays(from?: string | null, to?: string | null) {
  if (!from) return null
  const start = Date.parse(`${from.slice(0, 10)}T00:00:00Z`)
  const end = Date.parse(`${(to || todayISO()).slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  return Math.max(0, Math.floor((end - start) / 86400000))
}

export function toInt(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isInteger(n) ? n : null
}

export function toNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text ? text : null
}

export function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null
  return value.slice(0, 10)
}

type Totals = { mortality: number; culled: number }

/** Soma de baixas por lote. Se a tabela ainda não existir, devolve zeros (não parte a listagem). */
export async function lossTotals(admin: ReturnType<typeof getAdmin>, batchIds: string[]) {
  const totals: Record<string, Totals> = {}
  if (!batchIds.length) return totals
  const { data, error } = await admin.from('batch_losses').select('batch_id, quantity, loss_type').in('batch_id', batchIds)
  if (error) {
    console.error('[batches] batch_losses indisponível:', error.message)
    return totals
  }
  for (const row of data || []) {
    const t = (totals[row.batch_id] ||= { mortality: 0, culled: 0 })
    if (row.loss_type === 'culled') t.culled += row.quantity
    else t.mortality += row.quantity
  }
  return totals
}

export function withStats<T extends { id: string; birds_count: number; start_date?: string | null; hatch_date?: string | null; end_date?: string | null }>(
  batch: T,
  totals: Totals = { mortality: 0, culled: 0 }
) {
  const initial = Number(batch.birds_count) || 0
  const lost = totals.mortality + totals.culled
  return {
    ...batch,
    mortality_total: totals.mortality,
    culled_total: totals.culled,
    alive_count: Math.max(0, initial - lost),
    mortality_rate: initial > 0 ? Math.round((totals.mortality / initial) * 10000) / 100 : 0,
    age_days: ageInDays(batch.hatch_date || batch.start_date, batch.end_date),
  }
}

export function dbErrorMessage(error: { code?: string; message: string }) {
  if (error.code === '23505') return 'Já existe um lote com este código nesta quinta.'
  if (error.code === '23514') return 'Valores inválidos: confirme quantidades e datas (término depois do início, nascimento antes da entrada).'
  if (error.code === '42703') return `A base de dados ainda não tem as colunas novas. Execute a migração 10_batches_fase1.sql. (${error.message})`
  if (error.code === '42P01') return `Falta uma tabela. Execute a migração 10_batches_fase1.sql. (${error.message})`
  return error.message
}

export function failure(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  const status = /inicie sess/i.test(message) ? 401 : 500
  console.error('[batches]', message)
  return NextResponse.json({ error: message }, { status })
}