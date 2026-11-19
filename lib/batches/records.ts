import { NextResponse } from 'next/server'
import { cleanDate, cleanText, getAdmin, lossTotals, todayISO, withStats } from '@/lib/batches/server'

type Admin = ReturnType<typeof getAdmin>

export type OwnBatch = {
  id: string
  farm_id: string
  batch_code: string
  bird_type: string
  birds_count: number
  status: string
  start_date: string
  hatch_date?: string | null
  end_date?: string | null
}

export function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Lote da quinta autenticada (nunca devolve lotes de outra quinta). */
export async function loadOwnBatch(admin: Admin, farmId: string, batchId: string) {
  const { data, error } = await admin.from('batches').select('*').eq('id', batchId).eq('farm_id', farmId).maybeSingle()
  return { batch: (data as OwnBatch | null) ?? null, error }
}

/** Aves vivas = aves iniciais − baixas registadas em batch_losses. */
export async function aliveCount(admin: Admin, batch: OwnBatch) {
  const totals = await lossTotals(admin, [batch.id])
  return withStats(batch, totals[batch.id]).alive_count
}

/** Lê um número do corpo do pedido. Vazio = null; inválido devolve mensagem de erro. */
export function readNumber(raw: unknown, label: string, opts: { int?: boolean; min?: number; max?: number } = {}): { value: number | null; error?: string } {
  if (raw === '' || raw === null || raw === undefined) return { value: null }
  const n = Number(raw)
  if (!Number.isFinite(n)) return { value: null, error: `${label}: indique um número válido.` }
  if (opts.int && !Number.isInteger(n)) return { value: null, error: `${label}: tem de ser um número inteiro.` }
  if (opts.min !== undefined && n < opts.min) return { value: null, error: `${label}: não pode ser menor que ${opts.min}.` }
  if (opts.max !== undefined && n > opts.max) return { value: null, error: `${label}: não pode ser maior que ${opts.max}.` }
  return { value: n }
}

/** Data do registo: não pode ser antes da entrada do lote nem no futuro. */
export function resolveDate(raw: unknown, batch: OwnBatch): { date: string; error?: string } {
  const date = cleanDate(raw) || todayISO()
  if (date < String(batch.start_date).slice(0, 10)) return { date, error: 'A data não pode ser antes da entrada do lote.' }
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (date > tomorrow) return { date, error: 'A data não pode estar no futuro.' }
  return { date }
}

export function requireActive(batch: OwnBatch) {
  return batch.status === 'active' ? null : 'Este lote já não está ativo. Só é possível registar dados em lotes ativos.'
}

export function recordsDbMessage(error: { code?: string; message: string }) {
  if (error.code === '42703' || error.code === '42P01') return `A base de dados ainda não tem as colunas da Fase 3A. Execute a migração 11_producao_fase3a.sql no Supabase. (${error.message})`
  if (error.code === '23514') return 'Valores inválidos: confirme as quantidades (ovos partidos não podem passar os ovos recolhidos).'
  return error.message
}

/** Cria a baixa (fonte única das aves vivas). Devolve a baixa criada ou a mensagem de erro. */
export async function insertLoss(admin: Admin, input: {
  farmId: string
  userId: string
  batchId: string
  quantity: number
  date: string
  cause?: unknown
  notes?: unknown
}) {
  const { data, error } = await admin
    .from('batch_losses')
    .insert([{
      farm_id: input.farmId,
      batch_id: input.batchId,
      loss_date: input.date,
      quantity: input.quantity,
      loss_type: 'mortality',
      cause: cleanText(input.cause),
      notes: cleanText(input.notes),
      created_by: input.userId,
    }])
    .select()
    .single()
  return { loss: data as { id: string } | null, error }
}