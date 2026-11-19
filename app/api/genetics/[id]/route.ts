export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanText, failure, getAdmin } from '@/lib/batches/server'
import { GENETIC_BIRD_TYPES, geneticsError } from '@/lib/genetics/server'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const body = await request.json()
    const admin = getAdmin()

    const { data: current, error: loadError } = await admin.from('genetics').select('*').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (loadError) return NextResponse.json({ error: geneticsError(loadError) }, { status: 500 })
    if (!current) return NextResponse.json({ error: 'Genética não encontrada.' }, { status: 404 })

    const update: Record<string, unknown> = {}
    if ('genetic_name' in body) {
      const name = cleanText(body.genetic_name)
      if (!name) return NextResponse.json({ error: 'O nome da genética não pode ficar vazio.' }, { status: 400 })
      update.genetic_name = name
    }
    if ('genetic_code' in body) {
      const code = cleanText(body.genetic_code)
      if (!code) return NextResponse.json({ error: 'O código não pode ficar vazio.' }, { status: 400 })
      update.genetic_code = code
    }
    if ('bird_type' in body) {
      const birdType = cleanText(body.bird_type)
      if (birdType && !(GENETIC_BIRD_TYPES as readonly string[]).includes(birdType)) {
        return NextResponse.json({ error: 'Tipo de ave inválido.' }, { status: 400 })
      }
      update.bird_type = birdType
    }
    for (const key of ['category', 'origin', 'characteristics'] as const) {
      if (key in body) update[key] = cleanText(body[key])
    }
    if ('is_active' in body) update.is_active = body.is_active === true

    if (!Object.keys(update).length) return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })

    const { data, error } = await admin
      .from('genetics')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('farm_id', farmId)
      .select()
      .maybeSingle()
    if (error) {
      console.error('[genetics] PUT:', error)
      return NextResponse.json({ error: geneticsError(error) }, { status: error.code === '23505' ? 409 : 400 })
    }

    // Se o nome mudou, os lotes que usavam o nome antigo passam a usar o novo.
    let renamed = 0
    if (data && typeof update.genetic_name === 'string' && update.genetic_name !== current.genetic_name) {
      const { data: moved } = await admin
        .from('batches')
        .update({ genetics: update.genetic_name })
        .eq('farm_id', farmId)
        .eq('genetics', current.genetic_name)
        .select('id')
      renamed = moved?.length || 0
    }
    return NextResponse.json({ ...data, renamed_batches: renamed })
  } catch (error) {
    return failure(error, 'Falha ao atualizar genética')
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id } = await params
    const admin = getAdmin()

    const { data: current, error: loadError } = await admin.from('genetics').select('genetic_name').eq('id', id).eq('farm_id', farmId).maybeSingle()
    if (loadError) return NextResponse.json({ error: geneticsError(loadError) }, { status: 500 })
    if (!current) return NextResponse.json({ error: 'Genética não encontrada.' }, { status: 404 })

    const { count } = await admin.from('batches').select('id', { count: 'exact', head: true }).eq('farm_id', farmId).eq('genetics', current.genetic_name)
    if (count) {
      return NextResponse.json({
        error: `Esta genética está associada a ${count} lote(s). Desative-a em vez de a apagar, para manter o histórico.`,
        code: 'IN_USE',
      }, { status: 409 })
    }

    const { error } = await admin.from('genetics').delete().eq('id', id).eq('farm_id', farmId)
    if (error) return NextResponse.json({ error: geneticsError(error) }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error, 'Falha ao apagar genética')
  }
}