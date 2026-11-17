import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type SummaryResult<T> = {
  data: T[] | null
  error: { message: string; code?: string } | null
}

function rowsOrEmpty<T>(name: string, result: SummaryResult<T>): T[] {
  if (result.error) {
    console.error(`GET /api/dashboard/summary: consulta de ${name} falhou:`, result.error.message, result.error.code)
    return []
  }

  return result.data ?? []
}

const emptySummary = { batches: [], production: [], daily: [], costs: [], nutrition: [], alerts: [], lastDay: [] }

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const rawFrom = request.nextUrl.searchParams.get('from')
    const from = rawFrom && /^\d{4}-\d{2}-\d{2}$/.test(rawFrom) ? rawFrom : new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)

    const [batches, production, daily, costs, nutrition, alerts, latest] = await Promise.all([
      supabase.from('batches').select('status,birds_count,bird_type'),
      supabase.from('production_records').select('record_date,eggs_produced,mortality_count').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('daily_management_records').select('record_date,mortality_count').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('cost_records').select('record_date,amount').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('nutrition_records').select('record_date,consumption_kg').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('alerts').select('id,alert_type,alert_title,alert_message,status,created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
      supabase.from('production_records').select('record_date').order('record_date', { ascending: false }).limit(1),
    ])

    // Último dia com registos de produção. Só é preciso ir buscá-lo quando
    // fica fora da janela já carregada (ex.: ninguém registou há mais de 7 dias).
    let lastDay: unknown[] = []
    const latestDate = rowsOrEmpty('último registo', latest as SummaryResult<{ record_date: string }>)[0]?.record_date
    if (latestDate && String(latestDate) < from) {
      const lastDayResult = await supabase
        .from('production_records')
        .select('record_date,eggs_produced,mortality_count')
        .eq('record_date', latestDate)
        .limit(200)
      lastDay = rowsOrEmpty('último dia de produção', lastDayResult)
    }

    return NextResponse.json({
      batches: rowsOrEmpty('lotes', batches),
      production: rowsOrEmpty('produção', production),
      daily: rowsOrEmpty('gestão diária', daily),
      costs: rowsOrEmpty('custos', costs),
      nutrition: rowsOrEmpty('nutrição', nutrition),
      alerts: rowsOrEmpty('alertas', alerts),
      lastDay,
    })
  } catch (error) {
    console.error('GET /api/dashboard/summary failed:', error)
    // Mantém o painel utilizável se a base de dados estiver temporariamente indisponível.
    return NextResponse.json(emptySummary)
  }
}