export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const summary = request.nextUrl.searchParams.get('summary') === '1'
    const page = getApiPage(request)

    let query = getAdmin()
      .from('batches')
      .select(summary ? 'id,status,birds_count' : '*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false })

    if (page) query = query.range(page.offset, page.offset + page.limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('[v0] GET /api/batches supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/batches error:', error)
    const message = error instanceof Error ? error.message : 'Failed to load batches'
    const status = /sess[aã]o/i.test(message) ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data, error } = await getAdmin().from('batches').insert([record]).select().single()

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