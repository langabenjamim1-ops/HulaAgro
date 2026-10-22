import { createClient } from '@supabase/supabase-js'
import { getWialonSession, getWialonUnits } from '@/lib/wialon'
import { getSupabaseServerClient } from '@/lib/supabase/server'

type Topic = 'overview' | 'production' | 'health' | 'environment' | 'finance' | 'stock'
const day = 86_400_000

function database(farmId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) throw new Error('Dados do aviário não configurados: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.')
  return { client: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }), farmId }
}

export async function getAuthenticatedFarmContext() {
  const auth = await getSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) throw new Error('Inicie sessão para consultar os dados do aviário.')
  const { data: profile, error } = await auth.from('profiles').select('default_farm_id,role').eq('id', user.id).maybeSingle()
  if (error) throw new Error('Não foi possível carregar o perfil do cliente. Aplique a migração de gestão de clientes.')
  if (!profile?.default_farm_id) throw new Error('A conta ainda não tem um aviário associado. Contacte a administração.')
  return { userId: user.id, farmId: profile.default_farm_id as string, platformAdmin: profile.role === 'platform_admin' }
}

async function rows(table: string, columns: string, days: number, farmId: string, batchId?: string) {
  const { client } = database(farmId)
  let query = client.from(table).select(columns).eq('farm_id', farmId).gte('record_date', new Date(Date.now() - days * day).toISOString().slice(0, 10)).order('record_date', { ascending: false }).limit(100)
  if (batchId) query = query.eq('batch_id', batchId)
  const { data, error } = await query
  if (error) throw new Error(`Falha ao consultar ${table}: ${error.message}`)
  return data ?? []
}

export async function getFarmData(input: { topic?: Topic; days?: number; batch_code?: string }, farmId: string, platformAdmin = false) {
  const topic = input.topic ?? 'overview'
  const days = Math.max(1, Math.min(365, Math.floor(input.days ?? 30)))
  const { client } = database(farmId)
  const { data: batches, error: batchesError } = await client.from('batches').select('id,batch_code,bird_type,birds_count,genetics,facility_location,start_date,end_date,status').eq('farm_id', farmId).order('start_date', { ascending: false }).limit(100)
  if (batchesError) throw new Error(`Falha ao consultar lotes: ${batchesError.message}`)
  const selected = input.batch_code ? (batches ?? []).filter((b) => b.batch_code.toLowerCase() === input.batch_code!.toLowerCase()) : batches ?? []
  if (input.batch_code && !selected.length) return { topic, days, batches: [], message: 'Nenhum lote com esse código foi encontrado neste aviário.' }
  const batchIds = selected.map((b) => b.id)
  const matchingBatchId = input.batch_code ? batchIds[0] : undefined
  const include = (value: Topic) => topic === 'overview' || topic === value
  const result: Record<string, unknown> = { topic, period_days: days, batches: selected }
  if (include('production')) result.production = await rows('production_records', 'batch_id,record_date,eggs_produced,laying_rate,mortality_count,average_weight,feed_consumption,water_consumption,notes', days, farmId, matchingBatchId)
  if (include('health')) result.health = await rows('health_records', 'batch_id,record_date,health_status,disease_name,medication_applied,birds_affected,birds_recovered,notes', days, farmId, matchingBatchId)
  if (include('environment')) {
    result.environment = await rows('environmental_monitoring', 'batch_id,record_date,record_time,temperature,humidity,ventilation_status,air_quality,energy_consumption,water_temperature,notes', days, farmId, matchingBatchId)
    if (!platformAdmin) result.wialon_status = 'A integração Wialon ainda não está associada individualmente a esta conta.'
    else try {
      const units = await getWialonUnits()
      result.wialon = units.map((unit) => ({ name: unit.name, connected: unit.connected, lastMessage: unit.lastMessageTimestamp ? new Date(unit.lastMessageTimestamp * 1000).toISOString() : null, sensors: unit.sensors.map((sensor) => ({ name: sensor.name, value: sensor.formattedValue ?? sensor.value, unit: sensor.unit })) }))
    } catch (error) { result.wialon_status = error instanceof Error ? error.message : 'Wialon indisponível' }
  }
  if (include('finance')) {
    const costs = await client.from('cost_records').select('batch_id,record_date,cost_type,description,amount,currency,supplier_name').eq('farm_id', farmId).gte('record_date', new Date(Date.now() - days * day).toISOString().slice(0, 10)).order('record_date', { ascending: false }).limit(100)
    if (costs.error) throw new Error(`Falha ao consultar custos: ${costs.error.message}`)
    result.costs = costs.data ?? []
    const purchases = await client.from('purchases').select('purchase_date,supplier_name,product_type,quantity,unit,unit_cost,total_cost,currency,status').eq('farm_id', farmId).gte('purchase_date', new Date(Date.now() - days * day).toISOString().slice(0, 10)).order('purchase_date', { ascending: false }).limit(100)
    if (purchases.error) throw new Error(`Falha ao consultar compras: ${purchases.error.message}`)
    result.purchases = purchases.data ?? []
  }
  if (include('stock')) {
    const stock = await client.from('medications').select('medication_name,active_component,dosage_per_bird,unit,expiration_date,stock_quantity,cost_per_unit,currency').eq('farm_id', farmId).limit(100)
    if (stock.error) throw new Error(`Falha ao consultar stock: ${stock.error.message}`)
    result.medications = stock.data ?? []
  }
  return result
}

export async function getSystemStatus(farmId: string, platformAdmin = false) {
  const status: Record<string, unknown> = { checked_at: new Date().toISOString(), application: 'online', gemini: process.env.GEMINI_API_KEY?.trim() ? 'configurada' : 'não configurada' }
  try {
    const { client } = database(farmId)
    const { data, error } = await client.from('farms').select('id,farm_name').eq('id', farmId).maybeSingle()
    status.database = error ? `erro: ${error.message}` : data ? 'conectada' : 'conectada, mas HULAAGRO_FARM_ID não corresponde a uma exploração'
    if (data) status.farm = data.farm_name
  } catch (error) { status.database = error instanceof Error ? error.message : 'não configurada' }
  if (!platformAdmin) status.wialon = 'sem integração Wialon individual configurada'
  else if (!process.env.WIALON_TOKEN?.trim()) status.wialon = 'não configurado'
  else try { const session = await getWialonSession(); const units = await getWialonUnits(session); status.wialon = 'conectado'; status.wialon_units = units.length; status.connected_units = units.filter((u) => u.connected).length } catch (error) { status.wialon = `erro de conexão: ${error instanceof Error ? error.message : 'desconhecido'}` }
  return status
}
