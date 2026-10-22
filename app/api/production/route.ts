export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getApiPage } from '@/lib/api-pagination'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}


export async function GET(request: NextRequest) {
  try {
    const batchId = request.nextUrl.searchParams.get('batch_id')
    const cohort = request.nextUrl.searchParams.get('cohort')
    const dateFrom = request.nextUrl.searchParams.get('from')
    const page = getApiPage(request)
    const supabase = getSupabase()
    
    let query = supabase.from('production_records').select('*')
    
    if (batchId) {
      query = query.eq('batch_id', batchId)
    }
    if (dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      query = query.gte('record_date', dateFrom)
    }

    // These two legacy forms identify their records through the notes field.
    // Keep the filter explicit so the dedicated pages never mix cohorts.
    if (cohort === 'layers' || cohort === 'broilers') {
      query = query.ilike('notes', `%${cohort}%`)
    }
    
    query = query.order('record_date', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    
    if (error) {
      console.error('[v0] GET /api/production error:', error)
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/production error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('production_records')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/production error:', error)
    return NextResponse.json({ error: 'Failed to create production record' }, { status: 500 })
  }
}
