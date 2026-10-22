import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function getAdmin() {
  const auth = await getSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Inicie sessão.' }, { status: 401 }) }
  const { data: profile } = await auth.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'platform_admin') return { error: NextResponse.json({ error: 'Acesso reservado à administração da plataforma.' }, { status: 403 }) }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return { error: NextResponse.json({ error: 'Configuração administrativa Supabase em falta.' }, { status: 503 }) }
  return { user, db: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) }
}

export async function GET() {
  const admin = await getAdmin()
  if ('error' in admin) return admin.error
  const { data: tenants, error } = await admin.db.from('tenants').select('id,name,email,phone,status,plan,trial_started_at,trial_ends_at,created_at,farms(id,farm_name,location),profiles(id,full_name,role),subscriptions(id,status,current_period_end,subscription_plans(name,price,currency))').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Não foi possível carregar os clientes.' }, { status: 502 })
  return NextResponse.json({ customers: tenants ?? [] })
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdmin()
  if ('error' in admin) return admin.error
  let body: { tenant_id?: string; status?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Pedido inválido.' }, { status: 400 }) }
  const validStatuses = ['trialing','active','past_due','suspended','cancelled']
  if (!body.tenant_id || !validStatuses.includes(body.status ?? '')) return NextResponse.json({ error: 'Cliente ou estado inválido.' }, { status: 400 })
  const { data: previous } = await admin.db.from('tenants').select('status').eq('id', body.tenant_id).maybeSingle()
  if (!previous) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  const { error } = await admin.db.from('tenants').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', body.tenant_id)
  if (error) return NextResponse.json({ error: 'Não foi possível actualizar o estado do cliente.' }, { status: 502 })
  const subscriptionStatus = body.status === 'suspended' ? 'paused' : body.status === 'cancelled' ? 'cancelled' : body.status
  const { data: subscription } = await admin.db.from('subscriptions').select('id').eq('tenant_id', body.tenant_id).in('status', ['trialing','active','past_due','paused']).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (subscription) await admin.db.from('subscriptions').update({ status: subscriptionStatus, updated_at: new Date().toISOString(), ...(body.status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}) }).eq('id', subscription.id)
  await admin.db.from('tenant_audit_log').insert({ tenant_id: body.tenant_id, actor_user_id: admin.user.id, action: 'customer_status_changed', old_values: { status: previous.status }, new_values: { status: body.status } })
  return NextResponse.json({ ok: true })
}
