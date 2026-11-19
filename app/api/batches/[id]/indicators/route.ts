export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { failure, getAdmin, todayISO } from '@/lib/batches/server'
import { bad, loadOwnBatch, recordsDbMessage } from '@/lib/batches/records'
import { computeIndicators, type CostRow, type LossRow, type ProdRow, type Std } from '@/lib/batches/indicators'

type Ctx = { params: Promise<{ id: string }> }
type Admin = ReturnType<typeof getAdmin>

const PAGE = 1000

// O Supabase devolve no máximo 1000 linhas por pedido: lê por páginas para não perder registos antigos.
async function readAll<T>(build: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { code?: string; message: string } | null }>) {
  const rows: T[] = []
  for (let from = 0; from < 50_000; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1)
    if (error) return { rows, error }
    rows.push(...((data || []) as T[]))
    if (!data || data.length < PAGE) break
  }
  return { rows, error: null }
}

const norm = (value: unknown) => String(value ?? '').trim().toLowerCase()

// Indicadores do lote: postura, ração, custo por ovo, peso contra o alvo, conversão alimentar e previsão de abate.
export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const admin: Admin = getAdmin()

    const { batch, error: batchError } = await loadOwnBatch(admin, farmId, id)
    if (batchError) return bad(recordsDbMessage(batchError), 500)
    if (!batch) return bad('Lote não encontrado.', 404)

    const prod = await readAll<ProdRow>((from, to) => admin
      .from('production_records')
      .select('record_date, record_kind, eggs_produced, eggs_broken, feed_consumption, average_weight, sample_size')
      .eq('farm_id', farmId).eq('batch_id', id).order('record_date', { ascending: true }).range(from, to))
    if (prod.error) return bad(recordsDbMessage(prod.error), 500)

    const lossRes = await readAll<LossRow>((from, to) => admin
      .from('batch_losses').select('loss_date, quantity').eq('farm_id', farmId).eq('batch_id', id).range(from, to))
    if (lossRes.error) return bad(recordsDbMessage(lossRes.error), 500)

    // Custos: se a tabela não estiver acessível, os indicadores de custo ficam em branco (não bloqueia o resto).
    const costRes = await readAll<CostRow>((from, to) => admin
      .from('cost_records').select('cost_type, amount, currency').eq('farm_id', farmId).eq('batch_id', id).range(from, to))
    const costs = costRes.error ? [] : costRes.rows

    // Linhagem: o lote guarda o nome em texto; procura a genética da quinta com esse nome.
    const geneticsText = (batch as unknown as { genetics?: string | null }).genetics
    let genetics: { id: string; name: string } | null = null
    let standards: Std[] = []
    let standardsStatus: 'ok' | 'no_genetics' | 'no_standards' | 'not_migrated' = 'no_genetics'

    if (geneticsText) {
      const { data: list } = await admin.from('genetics').select('id, genetic_name').eq('farm_id', farmId)
      const match = (list || []).find((row) => norm(row.genetic_name) === norm(geneticsText))
      if (match) {
        genetics = { id: match.id as string, name: match.genetic_name as string }
        const { data, error } = await admin.from('genetics_standards').select('metric, age_days, value').eq('farm_id', farmId).eq('genetics_id', match.id)
        if (error) standardsStatus = error.code === '42P01' ? 'not_migrated' : 'no_standards'
        else {
          standards = (data || []).map((row) => ({ metric: row.metric, age_days: Number(row.age_days), value: Number(row.value) })) as Std[]
          standardsStatus = standards.length ? 'ok' : 'no_standards'
        }
      }
    }

    const indicators = computeIndicators({ batch, prod: prod.rows, losses: lossRes.rows, costs, standards, today: todayISO() })
    const notes = [...indicators.notes]
    if (standardsStatus === 'no_genetics') notes.push('Este lote não tem uma linhagem do catálogo associada, por isso não há padrão para comparar.')
    if (standardsStatus === 'no_standards') notes.push(`A linhagem «${genetics?.name}» ainda não tem padrões preenchidos (Configuração → Padrões das linhagens).`)
    if (standardsStatus === 'not_migrated') notes.push('Falta executar a migração 16_padroes_linhagem.sql no Supabase.')

    return NextResponse.json({
      ...indicators,
      notes,
      batch: { id: batch.id, batch_code: batch.batch_code, bird_type: batch.bird_type, status: batch.status },
      genetics,
      standards_status: standardsStatus,
    })
  } catch (error) {
    return failure(error, 'Falha ao calcular os indicadores do lote')
  }
}