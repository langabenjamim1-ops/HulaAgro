export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedFarmContext } from '@/lib/ai/farm-data'
import { dbErrorMessage, failure, getAdmin } from '@/lib/batches/server'

type Ctx = { params: Promise<{ id: string; lossId: string }> }

// Corrige um engano: remove uma baixa registada por erro.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { farmId } = await getAuthenticatedFarmContext()
    const { id, lossId } = await params
    const { data, error } = await getAdmin()
      .from('batch_losses')
      .delete()
      .eq('id', lossId)
      .eq('batch_id', id)
      .eq('farm_id', farmId)
      .select('id')
    if (error) return NextResponse.json({ error: dbErrorMessage(error) }, { status: 400 })
    if (!data?.length) return NextResponse.json({ error: 'Baixa não encontrada.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error, 'Falha ao remover a baixa')
  }
}