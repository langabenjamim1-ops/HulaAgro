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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const rawFrom = request.nextUrl.searchParams.get('from')
    const from = rawFrom && /^\d{4}-\d{2}-\d{2}$/.test(rawFrom) ? rawFrom : new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)

    const [batches, production, daily, costs, nutrition] = await Promise.all([
      supabase.from('batches').select('status,birds_count'),
      supabase.from('production_records').select('record_date,eggs_produced,mortality_count').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('daily_management_records').select('record_date,mortality_count').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('cost_records').select('record_date,amount').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
      supabase.from('nutrition_records').select('record_date,consumption_kg').gte('record_date', from).order('record_date', { ascending: false }).limit(1000),
    ])

    return NextResponse.json({
      batches: rowsOrEmpty('lotes', batches),
      production: rowsOrEmpty('produção', production),
      daily: rowsOrEmpty('gestão diária', daily),
      costs: rowsOrEmpty('custos', costs),
      nutrition: rowsOrEmpty('nutrição', nutrition),
    })
  } catch (error) {
    console.error('GET /api/dashboard/summary failed:', error)
    // Keep the dashboard usable if the database client or its configuration
    // is temporarily unavailable. Individual query failures are handled above.
    return NextResponse.json({ batches: [], production: [], daily: [], costs: [], nutrition: [] })
  }
}
