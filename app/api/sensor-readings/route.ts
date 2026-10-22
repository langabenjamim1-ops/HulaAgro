export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}


export async function GET(request: NextRequest) {
  try {
    const sensorId = request.nextUrl.searchParams.get('sensor_id')
    const supabase = getSupabase()
    
    let query = supabase.from('sensor_readings').select('*')
    
    if (sensorId) {
      query = query.eq('sensor_id', sensorId)
    }
    
    const { data, error } = await query.order('reading_time', { ascending: false })
    
    if (error) {
      console.error('[v0] GET /api/sensor-readings error:', error)
      return NextResponse.json([], { status: 200 })
    }
    
    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('[v0] GET /api/sensor-readings error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert([body])
      .select()
    
    if (error) throw error
    
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/sensor-readings error:', error)
    return NextResponse.json({ error: 'Failed to create sensor reading' }, { status: 500 })
  }
}
