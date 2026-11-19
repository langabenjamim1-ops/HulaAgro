export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { failure, getAdmin } from '@/lib/batches/server'
import { defaultCatalog } from '@/lib/batches/genetics'
import { geneticsError, slugCode } from '@/lib/genetics/server'

// Copia o catálogo padrão para a quinta. Não mexe nas genéticas que já existem.
export async function POST() {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const admin = getAdmin()

    const { data: existing, error: loadError } = await admin.from('genetics').select('genetic_name, genetic_code').eq('farm_id', farmId)
    if (loadError) return NextResponse.json({ error: geneticsError(loadError) }, { status: 500 })

    const names = new Set((existing || []).map((row) => String(row.genetic_name).toLowerCase()))
    const codes = new Set((existing || []).map((row) => String(row.genetic_code).toLowerCase()))

    const toInsert = defaultCatalog()
      .filter((item) => !names.has(item.genetic_name.toLowerCase()) && !codes.has(slugCode(item.genetic_name).toLowerCase()))
      .map((item) => ({ ...item, farm_id: farmId, genetic_code: slugCode(item.genetic_name), is_active: true }))

    if (toInsert.length) {
      const { error } = await admin.from('genetics').insert(toInsert)
      if (error) {
        console.error('[genetics] seed:', error)
        return NextResponse.json({ error: geneticsError(error) }, { status: 400 })
      }
    }
    return NextResponse.json({ inserted: toInsert.length, skipped: defaultCatalog().length - toInsert.length })
  } catch (error) {
    return failure(error, 'Falha ao importar o catálogo')
  }
}