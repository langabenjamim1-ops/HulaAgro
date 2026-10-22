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
    const recordType = request.nextUrl.searchParams.get('type')
    const page = getApiPage(request)
    const supabase = getSupabase()
    
    let query = supabase.from('health_records').select('*')
    
    if (batchId) {
      query = query.eq('batch_id', batchId)
    }
    if (recordType === 'quarantine') query = query.eq('health_status', 'quarantine')
    
    query = query.order('record_date', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    
    if (error) {
      console.error('[v0] GET /api/health error:', error)
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/health error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('health_records')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/health error:', error)
    return NextResponse.json({ error: 'Failed to create health record' }, { status: 500 })
  }
}
