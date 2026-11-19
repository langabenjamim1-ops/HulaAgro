export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { failure, getAdmin } from '@/lib/batches/server'
import { bad } from '@/lib/batches/records'

type Ctx = { params: Promise<{ id: string }> }

const METRICS = ['weight_g', 'laying_rate', 'slaughter_weight_g'] as const
type Metric = (typeof METRICS)[number]

function message(error: { code?: string; message: string }) {
  if (error.code === '42P01' || error.code === '42703') return `Falta executar a migração 16_padroes_linhagem.sql no Supabase. (${error.message})`
  return error.message
}

async function ownGenetics(farmId: string, id: string) {
  const { data, error } = await getAdmin().from('genetics').select('id').eq('id', id).eq('farm_id', farmId).maybeSingle()
  return { found: !!data, error }
}

// Lista os padrões da linhagem (da quinta autenticada).
export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const own = await ownGenetics(farmId, id)
    if (own.error) return bad(own.error.message, 500)
    if (!own.found) return bad('Genética não encontrada.', 404)

    const { data, error } = await getAdmin().from('genetics_standards').select('metric, age_days, value')
      .eq('farm_id', farmId).eq('genetics_id', id).order('metric').order('age_days')
    if (error) return bad(message(error), 500)
    return NextResponse.json(data || [])
  } catch (error) {
    return failure(error, 'Falha ao carregar os padrões da linhagem')
  }
}

// Substitui todos os padrões de UMA métrica: { metric, rows: [{ age_days, value }] }. Lista vazia = apagar essa métrica.
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()

    const metric = String(body.metric ?? '') as Metric
    if (!(METRICS as readonly string[]).includes(metric)) return bad('Métrica inválida.')
    if (!Array.isArray(body.rows)) return bad('Envie a lista de valores.')
    if (body.rows.length > 400) return bad('Demasiadas linhas (máximo 400).')

    const rows = new Map<number, number>()
    for (const [index, item] of (body.rows as Array<{ age_days?: unknown; value?: unknown }>).entries()) {
      const age = Number(item?.age_days)
      const value = Number(item?.value)
      if (!Number.isInteger(age) || age < 0 || age > 2000) return bad(`Linha ${index + 1}: idade inválida (dias entre 0 e 2000).`)
      if (!Number.isFinite(value) || value < 0 || value > 100_000) return bad(`Linha ${index + 1}: valor inválido.`)
      if (metric === 'laying_rate' && value > 100) return bad(`Linha ${index + 1}: a % de postura não pode passar de 100.`)
      rows.set(age, value) // idade repetida: fica a última
    }
    if (metric === 'slaughter_weight_g' && rows.size > 1) return bad('O peso de abate é um só valor.')

    const own = await ownGenetics(farmId, id)
    if (own.error) return bad(own.error.message, 500)
    if (!own.found) return bad('Genética não encontrada.', 404)

    const admin = getAdmin()
    const records = [...rows.entries()].map(([age_days, value]) => ({ farm_id: farmId, genetics_id: id, metric, age_days, value }))

    // Grava primeiro (upsert) e só depois remove o que sobrou, para nunca ficar sem padrões se algo falhar a meio.
    if (records.length) {
      const { error } = await admin.from('genetics_standards').upsert(records, { onConflict: 'genetics_id,metric,age_days' })
      if (error) return bad(message(error), 500)
    }
    let cleanup = admin.from('genetics_standards').delete().eq('farm_id', farmId).eq('genetics_id', id).eq('metric', metric)
    if (records.length) cleanup = cleanup.not('age_days', 'in', `(${records.map((r) => r.age_days).join(',')})`)
    const { error: cleanupError } = await cleanup
    if (cleanupError) return bad(message(cleanupError), 500)

    return NextResponse.json({ success: true, saved: records.length })
  } catch (error) {
    return failure(error, 'Falha ao guardar os padrões da linhagem')
  }
}