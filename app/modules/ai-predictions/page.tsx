'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, RefreshCw, TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getClientJson, pagedEndpoint } from '@/lib/client-data'

type RecordRow = Record<string, unknown>
const metrics = [
  { id: 'mortality_count', label: 'Mortalidade', unit: 'aves', endpoint: '/api/production' },
  { id: 'feed_consumption', label: 'Consumo de ração', unit: 'kg', endpoint: '/api/production' },
  { id: 'average_weight', label: 'Peso médio', unit: 'g', endpoint: '/api/production' },
  { id: 'laying_rate', label: 'Taxa de postura', unit: '%', endpoint: '/api/production' },
  { id: 'eggs_produced', label: 'Ovos produzidos', unit: 'ovos', endpoint: '/api/production' },
]

export default function AIPredictionsPage() {
  const [metricId, setMetricId] = useState(metrics[0].id)
  const [records, setRecords] = useState<RecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const metric = metrics.find((item) => item.id === metricId) ?? metrics[0]

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    getClientJson<unknown>(pagedEndpoint(metric.endpoint, 0))
      .then((payload) => {
        if (!Array.isArray(payload)) throw new Error('Formato de registos inválido.')
        setRecords(payload.filter((item): item is RecordRow => !!item && typeof item === 'object'))
      })
      .catch((cause) => { if (!controller.signal.aborted) { setRecords([]); setError(cause instanceof Error ? cause.message : 'Falha ao carregar os dados.') } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [metric.endpoint])

  const series = useMemo(() => {
    const history = records.flatMap((row) => {
      const value = Number(row[metric.id])
      const date = row.record_date ? new Date(String(row.record_date)) : null
      if (!Number.isFinite(value) || value < 0 || !date || Number.isNaN(date.getTime())) return []
      return [{ date: date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' }), timestamp: date.getTime(), actual: value, estimate: null as number | null }]
    }).sort((a, b) => a.timestamp - b.timestamp).slice(-20)
    if (history.length < 3) return history
    const window = history.slice(-Math.min(7, history.length))
    const mean = window.reduce((sum, row) => sum + row.actual, 0) / window.length
    const lastDate = new Date(history[history.length - 1].timestamp)
    const forecast = [1, 2, 3].map((offset) => {
      const date = new Date(lastDate)
      date.setDate(date.getDate() + offset)
      return { date: date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' }), timestamp: date.getTime(), actual: null as number | null, estimate: mean }
    })
    history[history.length - 1].estimate = history[history.length - 1].actual
    return [...history, ...forecast]
  }, [records, metric])

  const observations = records.filter((row) => Number.isFinite(Number(row[metric.id])) && Number(row[metric.id]) >= 0)
  const latest = observations.length ? Number(observations[0][metric.id]) : null
  const mean = observations.length ? observations.slice(0, 7).reduce((sum, row) => sum + Number(row[metric.id]), 0) / Math.min(observations.length, 7) : null

  return <div className="space-y-6 pb-8">
    <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#283106] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><div className="flex items-center gap-2 text-[#D1D8BD]"><Activity className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Análise de tendências</span></div><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Indicadores e projeções</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#E0E4D5]">Acompanha os valores registados e uma referência de tendência calculada a partir dos últimos dados disponíveis.</p></div><div className="rounded-xl bg-white/10 p-4"><p className="text-xs text-[#D1D8BD]">Registos usados</p><p className="mt-1 text-2xl font-bold">{loading ? '…' : observations.length}</p></div></section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map((item) => <button key={item.id} onClick={() => setMetricId(item.id)} className={`rounded-xl border p-4 text-left transition ${metricId === item.id ? 'border-[#687B2A] bg-[#EEF3DE] shadow-sm' : 'border-[#E2E5D9] bg-white hover:border-[#A6B27D]'}`}><span className="text-xs font-medium text-[#727964]">{item.label}</span><span className="mt-2 block text-xl font-bold text-[#283106]">{metricId === item.id && latest !== null ? latest.toLocaleString('pt-MZ', { maximumFractionDigits: 1 }) : '—'}<span className="ml-1 text-xs font-medium text-[#727964]">{item.unit}</span></span></button>)}</section>

    <section className="rounded-2xl border border-[#E2E5D9] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[#53602E]"><BarChart3 className="h-4 w-4" /><h2 className="font-bold">{metric.label}: histórico e tendência</h2></div><p className="mt-1 text-sm text-[#727964]">A linha tracejada mostra a média simples dos últimos registos, projetada para três dias.</p></div>{mean !== null && <div className="rounded-lg bg-[#F3F5EC] px-3 py-2"><span className="text-xs text-[#727964]">Média recente</span><p className="font-bold text-[#283106]">{mean.toLocaleString('pt-MZ', { maximumFractionDigits: 1 })} {metric.unit}</p></div>}</div>
      {loading ? <div className="flex h-64 items-center justify-center gap-2 text-sm text-[#68734C]"><RefreshCw className="h-4 w-4 animate-spin" />A carregar histórico…</div> : error ? <div role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{error}</div> : series.length === 0 ? <div className="flex h-64 flex-col items-center justify-center rounded-xl bg-[#FAFBF7] text-center"><TrendingUp className="h-8 w-8 text-[#A0AA82]" /><p className="mt-3 text-sm font-medium text-[#53602E]">Ainda não há dados para projetar esta métrica.</p><p className="mt-1 text-xs text-[#727964]">Regista dados de produção para gerar uma análise.</p></div> : series.length < 3 ? <div className="rounded-lg bg-[#FAFBF7] p-3 text-sm text-[#727964]">São necessários pelo menos três registos para calcular uma tendência. Os dados disponíveis continuam apresentados no gráfico.</div> : null}
      {!loading && !error && series.length > 0 && <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={series} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7DB" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => value == null ? '—' : `${Number(value).toLocaleString('pt-MZ', { maximumFractionDigits: 1 })} ${metric.unit}`} /><Line type="monotone" dataKey="actual" name="Registado" stroke="#687B2A" strokeWidth={2.5} connectNulls={false} dot={{ r: 3 }} /><Line type="monotone" dataKey="estimate" name="Referência projetada" stroke="#D4A72C" strokeWidth={2} strokeDasharray="5 5" connectNulls={false} dot={false} /></LineChart></ResponsiveContainer></div>}
      <p className="mt-4 border-t border-[#EEF0E9] pt-3 text-xs leading-5 text-[#7A8067]">A projeção é uma média estatística simples dos dados disponíveis, não um modelo treinado nem uma garantia de resultado. Verifica a tendência com os registos da exploração.</p>
    </section>
  </div>
}
