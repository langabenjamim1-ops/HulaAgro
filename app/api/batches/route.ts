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
    const body = await request.json()
    
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('batches')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/batches error:', error)
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}
