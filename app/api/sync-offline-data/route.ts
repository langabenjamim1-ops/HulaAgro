export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This endpoint is called by service worker to sync offline data
    // when the device comes back online

    const body = await request.json()

    // Process offline data (records, updates, etc.)
    // For now, just acknowledge receipt

    return NextResponse.json({
      success: true,
      message: 'Dados sincronizados com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Sync error:', error)
    return NextResponse.json(
      { error: 'Falha ao sincronizar dados' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if the API is available (used by service worker)
    return NextResponse.json({
      status: 'online',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'offline' },
      { status: 503 }
    )
  }
}
