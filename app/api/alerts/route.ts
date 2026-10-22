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
    const facilityId = request.nextUrl.searchParams.get('facility_id')
    const alertType = request.nextUrl.searchParams.get('alert_type') || request.nextUrl.searchParams.get('priority')
    const status = request.nextUrl.searchParams.get('status')
    const page = getApiPage(request)
    const supabase = getSupabase()
    
    let query = supabase.from('alerts').select('*')
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    if (alertType) {
      query = query.eq('alert_type', alertType)
    }
    if (status) {
      query = query.eq('status', status)
    }
    
    query = query.order('created_at', { ascending: false })
    if (page) query = query.range(page.offset, page.offset + page.limit - 1)
    const { data, error } = await query
    
    if (error) {
      console.error('[v0] GET /api/alerts error:', error)
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/alerts error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('alerts')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/alerts error:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
