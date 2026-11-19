export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { cleanText, failure, getAdmin } from '@/lib/batches/server'
import { GENETIC_BIRD_TYPES, geneticsError, slugCode } from '@/lib/genetics/server'

// Lista as genéticas da quinta. Por defeito só as ativas; ?all=1 inclui as desativadas.
export async function GET(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const all = request.nextUrl.searchParams.get('all') === '1'
    const admin = getAdmin()

    let query = admin.from('genetics').select('*').eq('farm_id', farmId).order('category', { ascending: true }).order('genetic_name', { ascending: true })
    if (!all) query = query.eq('is_active', true)

    const { data, error } = await query
    if (error) {
      console.error('[genetics] GET:', error)
      return NextResponse.json({ error: geneticsError(error) }, { status: 500 })
    }

    // Quantos lotes usam cada genética (o lote guarda o nome da linhagem).
    const { data: used } = await admin.from('batches').select('genetics').eq('farm_id', farmId)
    const counts = new Map<string, number>()
    for (const row of used || []) {
      const key = String(row.genetics || '').trim().toLowerCase()
      if (key) counts.set(key, (counts.get(key) || 0) + 1)
    }

    return NextResponse.json((data || []).map((item) => ({ ...item, batches_count: counts.get(String(item.genetic_name).toLowerCase()) || 0 })))
  } catch (error) {
    return failure(error, 'Falha ao carregar genéticas')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const body = await request.json()

    const name = cleanText(body.genetic_name)
    const birdType = cleanText(body.bird_type)
    if (!name) return NextResponse.json({ error: 'Indique o nome da genética.' }, { status: 400 })
    if (birdType && !(GENETIC_BIRD_TYPES as readonly string[]).includes(birdType)) {
      return NextResponse.json({ error: 'Tipo de ave inválido.' }, { status: 400 })
    }

    const record = {
      farm_id: farmId,
      genetic_name: name,
      genetic_code: cleanText(body.genetic_code) || slugCode(name),
      bird_type: birdType,
      category: cleanText(body.category),
      origin: cleanText(body.origin),
      characteristics: cleanText(body.characteristics),
      is_active: true,
    }

    const { data, error } = await getAdmin().from('genetics').insert([record]).select().single()
    if (error) {
      console.error('[genetics] POST:', error)
      return NextResponse.json({ error: geneticsError(error) }, { status: error.code === '23505' ? 409 : 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return failure(error, 'Falha ao criar genética')
  }
}