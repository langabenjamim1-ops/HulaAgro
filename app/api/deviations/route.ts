export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
}

export async function GET(request: NextRequest) {
  try {
    const farmId = request.nextUrl.searchParams.get('farm_id')
    const batchId = request.nextUrl.searchParams.get('batch_id')
    const page = getApiPage(request)
    const supabase = getSupabase()
    let query = supabase.from('deviations').select('*')
    if (farmId) query = query.eq('farm_id', farmId)
    if (batchId) query = query.eq('batch_id', batchId)
    query = query.order('deviation_date', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[GET /api/deviations]', error)
    return NextResponse.json({ error: 'Não foi possível carregar os desvios.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body?.farm_id || !body?.deviation_date || !body?.deviation_type) {
      return NextResponse.json({ error: 'Indica a exploração, a data e o tipo de desvio.' }, { status: 400 })
    }
    const supabase = getSupabase()
    const { data, error } = await supabase.from('deviations').insert([body]).select().single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/deviations]', error)
    return NextResponse.json({ error: 'Não foi possível guardar o desvio.' }, { status: 500 })
  }
}
