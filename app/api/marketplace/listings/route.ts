import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
const categories = ['eggs','birds','feed','medicines','equipment','services','other']

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Entre na sua conta para usar o marketplace.' }, { status: 401 })
  const search = request.nextUrl.searchParams.get('q')?.trim().slice(0,100)
  const category = request.nextUrl.searchParams.get('category')
  const scope = request.nextUrl.searchParams.get('scope')
  let query = supabase.from('marketplace_listings').select('id,seller_tenant_id,seller_user_id,title,description,category,listing_type,item_condition,quantity,unit,unit_price,currency,location,image_url,status,created_at,updated_at')
  if (scope === 'mine') query = query.eq('seller_user_id',user.id)
  else query = query.eq('status','active')
  if (category && categories.includes(category)) query = query.eq('category',category)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  const { data, error } = await query.order('created_at',{ascending:false}).limit(100)
  if (error) return NextResponse.json({ error: 'Não foi possível carregar os anúncios. Aplique a migração 002_marketplace.sql.' },{status:502})
  const sellerIds = [...new Set((data ?? []).map((row) => row.seller_tenant_id))]
  const sellers = sellerIds.length ? await supabase.from('marketplace_public_sellers').select('tenant_id,name,location').in('tenant_id',sellerIds) : {data:[],error:null}
  const sellerById = new Map((sellers.data ?? []).map((seller) => [seller.tenant_id,seller]))
  return NextResponse.json({ listings:(data ?? []).map((listing) => ({...listing,seller:sellerById.get(listing.seller_tenant_id) ?? null})) })
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Entre na sua conta para publicar um anúncio.' },{status:401})
  let body: Record<string,unknown>
  try { body = await request.json() } catch { return NextResponse.json({error:'Dados inválidos.'},{status:400}) }
  const title = typeof body.title==='string' ? body.title.trim() : ''
  const description = typeof body.description==='string' ? body.description.trim() : ''
  const category = String(body.category ?? '')
  const listingType = body.listing_type === 'service' ? 'service' : 'product'
  const condition = ['new','used','not_applicable'].includes(String(body.item_condition)) ? String(body.item_condition) : 'new'
  const quantity = Number(body.quantity)
  const unitPrice = Number(body.unit_price)
  const currency = ['MZN','ZAR','USD'].includes(String(body.currency)) ? String(body.currency) : 'MZN'
  const unit = typeof body.unit==='string' ? body.unit.trim().slice(0,30) : ''
  const imageUrl = typeof body.image_url==='string' ? body.image_url.trim() : ''
  if (title.length<4 || title.length>140 || description.length<10 || description.length>5000 || !categories.includes(category) || !unit || !Number.isFinite(quantity) || quantity<=0 || !Number.isFinite(unitPrice) || unitPrice<0) return NextResponse.json({error:'Confira título, descrição, categoria, quantidade, unidade e preço.'},{status:400})
  if (imageUrl) { try { const url = new URL(imageUrl); if (!['http:','https:'].includes(url.protocol)) throw new Error() } catch { return NextResponse.json({error:'A imagem deve usar um endereço HTTP ou HTTPS válido.'},{status:400}) } }
  const { data, error } = await supabase.from('marketplace_listings').insert({ title,description,category,listing_type:listingType,item_condition:condition,quantity,unit,unit_price:unitPrice,currency,location:typeof body.location==='string'?body.location.trim().slice(0,160):null,image_url:imageUrl||null }).select('id,title,status').single()
  if (error) return NextResponse.json({error:error.message.includes('conta') ? error.message : 'Não foi possível publicar o anúncio. Verifique se a conta está activa.'},{status:403})
  return NextResponse.json({listing:data},{status:201})
}
