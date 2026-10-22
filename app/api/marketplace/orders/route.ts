import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const {data:{user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error:'Inicie sessão.'},{status:401})
  const {data,error} = await supabase.from('marketplace_orders').select('id,listing_id,listing_title,buyer_tenant_id,buyer_user_id,seller_tenant_id,seller_user_id,quantity,unit,unit_price,total,currency,buyer_note,status,created_at,updated_at,resolved_at').order('created_at',{ascending:false}).limit(100)
  if (error) return NextResponse.json({error:'Não foi possível carregar os pedidos. Aplique a migração do marketplace.'},{status:502})
  return NextResponse.json({orders:data ?? [],user_id:user.id})
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const {data:{user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error:'Entre na sua conta para fazer um pedido.'},{status:401})
  let body: {listing_id?:string;quantity?:number;buyer_note?:string}
  try { body=await request.json() } catch { return NextResponse.json({error:'Pedido inválido.'},{status:400}) }
  if (!body.listing_id || !Number.isFinite(Number(body.quantity)) || Number(body.quantity)<=0 || (body.buyer_note?.length ?? 0)>1000) return NextResponse.json({error:'Indique o anúncio, quantidade e uma nota com até 1.000 caracteres.'},{status:400})
  const {data,error} = await supabase.rpc('marketplace_create_order',{p_listing_id:body.listing_id,p_quantity:Number(body.quantity),p_note:body.buyer_note?.trim() || null})
  if (error) return NextResponse.json({error:error.message},{status:409})
  return NextResponse.json({order_id:data},{status:201})
}

export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const {data:{user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error:'Inicie sessão.'},{status:401})
  let body: {order_id?:string;status?:string}
  try { body=await request.json() } catch { return NextResponse.json({error:'Pedido inválido.'},{status:400}) }
  if (!body.order_id || !['accepted','rejected','cancelled','completed'].includes(body.status ?? '')) return NextResponse.json({error:'Estado ou pedido inválido.'},{status:400})
  const {error} = await supabase.rpc('marketplace_update_order',{p_order_id:body.order_id,p_status:body.status})
  if (error) return NextResponse.json({error:error.message},{status:409})
  return NextResponse.json({ok:true})
}
