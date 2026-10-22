import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Template para criar API routes reutilizáveis
export async function createGetEndpoint(tableName: string) {
  return async (request: NextRequest) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`[v0] GET /${tableName} error:`, error)
        return NextResponse.json([], { status: 200 })
      }

      return NextResponse.json(data || [], { status: 200 })
    } catch (error) {
      console.error(`[v0] GET /${tableName} error:`, error)
      return NextResponse.json([], { status: 200 })
    }
  }
}

export async function createPostEndpoint(tableName: string) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()

      const { data, error } = await supabase
        .from(tableName)
        .insert([body])
        .select()

      if (error) throw error

      return NextResponse.json(data[0], { status: 201 })
    } catch (error) {
      console.error(`[v0] POST /${tableName} error:`, error)
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
    }
  }
}

export async function createGetByIdEndpoint(tableName: string) {
  return async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error(`[v0] GET /${tableName}/:id error:`, error)
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }
  }
}

export async function createUpdateEndpoint(tableName: string) {
  return async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json()

      const { data, error } = await supabase
        .from(tableName)
        .update(body)
        .eq('id', params.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data, { status: 200 })
    } catch (error) {
      console.error(`[v0] PUT /${tableName}/:id error:`, error)
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
    }
  }
}

export async function createDeleteEndpoint(tableName: string) {
  return async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', params.id)

      if (error) throw error

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error(`[v0] DELETE /${tableName}/:id error:`, error)
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
    }
  }
}
