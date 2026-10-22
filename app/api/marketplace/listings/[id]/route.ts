import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error:'Inicie sessão.'},{status:401})
  const { id } = await context.params
  let body: {status?:string}
  try { body = await request.json() } catch { return NextResponse.json({error:'Pedido inválido.'},{status:400}) }
  if (!['active','paused','removed'].includes(body.status ?? '')) return NextResponse.json({error:'Estado inválido.'},{status:400})
  const { data: listing,error: readError } = await supabase.from('marketplace_listings').select('quantity').eq('id',id).eq('seller_user_id',user.id).maybeSingle()
  if (readError || !listing) return NextResponse.json({error:'Anúncio não encontrado ou sem permissão.'},{status:404})
  if (body.status==='active' && Number(listing.quantity)<=0) return NextResponse.json({error:'Não é possível activar um anúncio sem stock.'},{status:409})
  const {error} = await supabase.from('marketplace_listings').update({status:body.status,updated_at:new Date().toISOString()}).eq('id',id).eq('seller_user_id',user.id)
  if (error) return NextResponse.json({error:'Não foi possível actualizar o anúncio.'},{status:502})
  return NextResponse.json({ok:true})
}
