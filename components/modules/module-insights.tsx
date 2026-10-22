'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Activity, BarChart3, RefreshCw } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

type Row = Record<string, unknown>
type Config = { endpoint: string; title: string; measure: string; label: string; unit?: string; category: string; date: string; arrayKey?: string }
const configs: Array<{ match: (path: string) => boolean; config: Config }> = [
  { match: (p) => p.includes('/batches'), config: { endpoint: '/api/batches', title: 'Lotes por data de início', measure: 'birds_count', label: 'Aves alojadas', unit: 'aves', category: 'status', date: 'start_date' } },
  { match: (p) => p.includes('/analysis/genetics-comparison'), config: { endpoint: '/api/batches', title: 'Lotes por genética', measure: 'birds_count', label: 'Aves alojadas', unit: 'aves', category: 'genetics', date: 'start_date' } },
  { match: (p) => p.includes('/analysis/feed-comparison') || p.includes('/production-analysis/feed-consumption'), config: { endpoint: '/api/nutrition', title: 'Consumo de ração', measure: 'consumption_kg', label: 'Consumo', unit: 'kg', category: 'feed_type', date: 'record_date' } },
  { match: (p) => p.includes('/production-analysis'), config: { endpoint: '/api/production', title: 'Produção registada', measure: 'eggs_produced', label: 'Ovos', unit: 'ovos', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/production/layers'), config: { endpoint: '/api/production?cohort=layers', title: 'Produção de poedeiras', measure: 'eggs_produced', label: 'Ovos', unit: 'ovos', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/production/broilers'), config: { endpoint: '/api/production?cohort=broilers', title: 'Desempenho de frangos de corte', measure: 'average_weight', label: 'Peso médio', unit: 'g', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/production') || p.includes('/analysis'), config: { endpoint: '/api/production', title: 'Produção registada', measure: 'eggs_produced', label: 'Ovos', unit: 'ovos', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/health') || p.includes('/disease-detection'), config: { endpoint: '/api/health', title: 'Registos de saúde', measure: 'birds_affected', label: 'Aves afetadas', unit: 'aves', category: 'health_status', date: 'record_date' } },
  { match: (p) => p.includes('/environment/energy'), config: { endpoint: '/api/environmental-monitoring?type=energy', title: 'Consumo energético', measure: 'energy_consumption', label: 'Energia', unit: 'kWh', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/environment/humidity'), config: { endpoint: '/api/environmental-monitoring?type=humidity', title: 'Leituras de humidade', measure: 'humidity', label: 'Humidade', unit: '%', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/environment/temperature'), config: { endpoint: '/api/environmental-monitoring?type=temperature', title: 'Leituras de temperatura', measure: 'temperature', label: 'Temperatura', unit: '°C', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/environment/ventilation'), config: { endpoint: '/api/environmental-monitoring?type=ventilation', title: 'Leituras de ventilação', measure: 'id', label: 'Leituras', category: 'ventilation_status', date: 'record_date' } },
  { match: (p) => p.includes('/environment'), config: { endpoint: '/api/environmental-monitoring', title: 'Leituras ambientais', measure: 'temperature', label: 'Temperatura', unit: '°C', category: 'ventilation_status', date: 'record_date' } },
  { match: (p) => p.includes('/costs/losses'), config: { endpoint: '/api/daily-management', title: 'Mortalidade registada', measure: 'mortality_count', label: 'Aves mortas', unit: 'aves', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/nutrition/costs') || p.includes('/costs/feed'), config: { endpoint: '/api/costs?cost_type=feed', title: 'Custos de ração', measure: 'amount', label: 'Custos', unit: 'MZN', category: 'currency', date: 'record_date' } },
  { match: (p) => p.includes('/costs/health'), config: { endpoint: '/api/costs?cost_type=health', title: 'Custos de saúde', measure: 'amount', label: 'Custos', unit: 'MZN', category: 'currency', date: 'record_date' } },
  { match: (p) => p.includes('/costs/operational'), config: { endpoint: '/api/costs?cost_type=operational', title: 'Custos operacionais', measure: 'amount', label: 'Custos', unit: 'MZN', category: 'currency', date: 'record_date' } },
  { match: (p) => p.includes('/costs') || p.includes('/credit-alerts'), config: { endpoint: '/api/costs', title: 'Custos registados', measure: 'amount', label: 'Custo', unit: 'MZN', category: 'cost_type', date: 'record_date' } },
  { match: (p) => p.includes('/purchases/management') || p === '/modules/purchases', config: { endpoint: '/api/purchases', title: 'Compras por data', measure: 'total_cost', label: 'Valor comprado', unit: 'MZN', category: 'status', date: 'purchase_date' } },
  { match: (p) => p.includes('/nutrition'), config: { endpoint: '/api/nutrition', title: 'Consumo de ração', measure: 'consumption_kg', label: 'Consumo', unit: 'kg', category: 'feed_type', date: 'record_date' } },
  { match: (p) => p.includes('/daily-management/weight'), config: { endpoint: '/api/daily-management', title: 'Peso médio por registo', measure: 'average_weight_grams', label: 'Peso médio', unit: 'g', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/daily-management/water'), config: { endpoint: '/api/daily-management', title: 'Consumo de água por registo', measure: 'water_consumption_liters', label: 'Consumo', unit: 'L', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/daily-management/mortality'), config: { endpoint: '/api/daily-management', title: 'Mortalidade por registo', measure: 'mortality_count', label: 'Mortalidade', unit: 'aves', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/daily-management/records'), config: { endpoint: '/api/daily-management', title: 'Registos de manejo diário', measure: 'id', label: 'Registos', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p === '/modules/daily-management', config: { endpoint: '/api/daily-management', title: 'Registos de manejo diário', measure: 'id', label: 'Registos', category: 'batch_id', date: 'record_date' } },
  { match: (p) => p.includes('/alerts/deviations'), config: { endpoint: '/api/deviations', title: 'Desvios técnicos registados', measure: 'id', label: 'Desvios', category: 'status', date: 'deviation_date' } },
  { match: (p) => p.includes('/alerts/critical'), config: { endpoint: '/api/alerts?alert_type=critical&status=active', title: 'Alertas críticos ativos', measure: 'id', label: 'Alertas', category: 'status', date: 'created_at' } },
  { match: (p) => p === '/modules/alerts', config: { endpoint: '/api/alerts', title: 'Alertas por estado', measure: 'id', label: 'Alertas', category: 'status', date: 'created_at' } },
  { match: (p) => p === '/modules/hr' || p.includes('/hr/employees') || p.includes('/hr/payroll') || p.includes('/hr/vacation'), config: { endpoint: '/api/employees', title: 'Funcionários por situação', measure: 'id', label: 'Funcionários', category: 'employment_status', date: 'hire_date' } },
  { match: (p) => p.includes('/supplies'), config: { endpoint: '/api/purchases', title: 'Abastecimentos registados', measure: 'quantity', label: 'Quantidade', category: 'product_type', date: 'purchase_date' } },
  { match: (p) => p.includes('/wialon'), config: { endpoint: '/api/wialon/fleet', title: 'Estado das unidades Wialon', measure: 'id', label: 'Unidades', category: 'connected', date: 'lastMessageTimestamp', arrayKey: 'units' } },
  { match: (p) => p.includes('/configuration'), config: { endpoint: '/api/genetics', title: 'Genéticas registadas', measure: 'id', label: 'Genéticas', category: 'bird_type', date: 'created_at' } },
  { match: (p) => p.includes('/ai-predictions'), config: { endpoint: '/api/production', title: 'Registos usados como base de análise', measure: 'eggs_produced', label: 'Ovos registados', unit: 'ovos', category: 'batch_id', date: 'record_date' } },
]
const colors = ['#687B2A', '#A0B45B', '#D4A72C', '#C36A42', '#456B7A', '#8C6E9E']
const number = (value: unknown) => typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) || 0 : 0
const label = (value: unknown) => value == null || value === '' ? 'Sem classificação' : String(value)

export function ModuleInsights() {
  const pathname = usePathname()
  const config = useMemo(() => configs.find(({ match }) => match(pathname))?.config, [pathname])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const load = useCallback(async (signal?: AbortSignal) => {
    if (!config) return
    setLoading(true); setFailed(false)
    try {
      const payload: unknown = await getClientJson(config.arrayKey ? config.endpoint : pagedEndpoint(config.endpoint, 0))
      if (signal?.aborted) return
      const object = payload && typeof payload === 'object' ? payload as Record<string, unknown> : null
      const list = Array.isArray(payload) ? payload : object && config.arrayKey && Array.isArray(object[config.arrayKey]) ? object[config.arrayKey] as unknown[] : object && Array.isArray(object.data) ? object.data : []
      setRows(list.filter((item): item is Row => !!item && typeof item === 'object'))
    } catch (error) {
      if (!signal?.aborted && !(error instanceof DOMException && error.name === 'AbortError')) setFailed(true)
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [config])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  const chart = useMemo(() => {
    if (!config) return { trend: [] as { date: string; value: number }[], categories: [] as { name: string; value: number }[], total: 0 }
    const days = new Map<string, number>()
    const groups = new Map<string, number>()
    let total = 0
    for (const row of rows) {
      const raw = row[config.date]
      const parsed = typeof raw === 'number' ? new Date(raw < 1e12 ? raw * 1000 : raw) : raw ? new Date(String(raw)) : null
      const day = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' }) : 'Sem data'
      const value = config.measure === 'id' ? 1 : number(row[config.measure])
      total += value
      days.set(day, (days.get(day) ?? 0) + value)
      const group = config.category === 'connected' ? (row.connected ? 'Online' : 'Offline') : label(row[config.category])
      groups.set(group, (groups.get(group) ?? 0) + 1)
    }
    return { trend: [...days].slice(-10).map(([date, value]) => ({ date, value })), categories: [...groups].slice(0, 7).map(([name, value]) => ({ name, value })), total }
  }, [rows, config])

  if (!config || (!loading && !failed && rows.length === 0)) return null
  return <section aria-label="Indicadores do módulo" className="mb-6 rounded-2xl border border-[#E2E5D9] bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[#53602E]"><Activity className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wide">Indicadores do módulo</span></div><h2 className="mt-1 text-base font-bold text-[#283106]">{config.title}</h2><p className="mt-1 text-xs text-[#777E5C]">Dados consultados em tempo real · {rows.length} registos</p></div><div className="flex items-center gap-3"><div className="rounded-lg bg-[#F3F5EC] px-3 py-2 text-right"><div className="text-[11px] text-[#777E5C]">{config.label}</div><div className="text-lg font-bold text-[#283106]">{loading ? '…' : `${chart.total.toLocaleString('pt-MZ', { maximumFractionDigits: 1 })}${config.unit ? ` ${config.unit}` : ''}`}</div></div><button onClick={() => { invalidateClientData(config.endpoint); void load() }} title="Atualizar indicadores" aria-label="Atualizar indicadores" disabled={loading} className="rounded-lg border border-[#E2E5D9] p-2 text-[#687B2A] hover:bg-[#F6F7F3] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
    {failed ? <div role="status" className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-900">Não foi possível carregar os indicadores. Os restantes controlos do módulo continuam disponíveis.</div> : rows.length === 0 ? <div className="flex items-center gap-2 rounded-lg bg-[#F7F7F3] px-3 py-3 text-sm text-[#777E5C]"><BarChart3 className="h-4 w-4" />Ainda não existem registos para gerar gráficos neste módulo.</div> : <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]"><div className="h-56 min-w-0 rounded-xl bg-[#FCFCFA] p-2"><div className="mb-1 text-xs font-semibold text-[#53602E]">{config.label} ao longo do tempo</div><ResponsiveContainer width="100%" height="90%"><LineChart data={chart.trend} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7DB" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="value" name={config.label} stroke="#687B2A" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div><div className="h-56 min-w-0 rounded-xl bg-[#FCFCFA] p-2"><div className="mb-1 text-xs font-semibold text-[#53602E]">Distribuição por categoria</div><ResponsiveContainer width="100%" height="90%"><BarChart data={chart.categories} margin={{ top: 5, right: 8, left: -22, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7DB" /><XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" name="Registos" radius={[4, 4, 0, 0]}>{chart.categories.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></div>}
  </section>
}
