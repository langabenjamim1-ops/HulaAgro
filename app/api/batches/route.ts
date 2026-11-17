export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}


export async function GET(request: NextRequest) {
  try {
    const farmId = request.nextUrl.searchParams.get('farm_id')
    const summary = request.nextUrl.searchParams.get('summary') === '1'
    const page = getApiPage(request)
    const supabase = getSupabase()
    
    let query = supabase.from('batches').select(summary ? 'id,status,birds_count' : '*')
    
    if (farmId) {
      query = query.eq('farm_id', farmId)
    }
    
    query = query.order('created_at', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    
    if (error) {
      console.error('[v0] GET /api/batches error:', error)
      // Return empty array if table doesn't exist yet
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/batches error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1) Utilizador autenticado + quinta dele (não confiar no farm_id vindo do browser)
    const { farmId } = await getAuthenticatedFarmContext()

    const body = await request.json()
    const record = {
      farm_id: farmId,
      batch_code: body.batch_code,
      bird_type: body.bird_type,
      birds_count: Number(body.birds_count),
      genetics: body.genetics || null,
      facility_location: body.facility_location || null,
      start_date: body.start_date,
      status: body.status || 'active',
      notes: body.notes || null,
    }

    // 2) Inserir com a chave de serviço (apenas servidor): o cliente anon é bloqueado pelo RLS
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { data, error } = await admin.from('batches').insert([record]).select().single()

    if (error) {
      console.error('[v0] POST /api/batches supabase error:', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/batches error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create batch'
    const status = /sess[aã]o/i.test(message) ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}