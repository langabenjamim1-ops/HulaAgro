'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Droplets, Plus, Scale, Skull, ClipboardList, LoaderCircle } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

type Kind = 'records' | 'mortality' | 'water' | 'weight'
type Row = Record<string, unknown>
type Batch = { id: string; name: string }
const settings = {
  records: { title: 'Registos diários', description: 'Acompanha as observações de manejo registadas para cada lote.', label: 'Atividade das aves', field: 'bird_activity', icon: ClipboardList, fields: [{ name: 'bird_activity', label: 'Atividade das aves', type: 'text' }, { name: 'feed_consumption_status', label: 'Estado do consumo de ração', type: 'text' }, { name: 'notes', label: 'Observações', type: 'text' }] },
  mortality: { title: 'Mortalidade', description: 'Regista e acompanha perdas de aves por lote.', label: 'Aves mortas', field: 'mortality_count', icon: Skull, fields: [{ name: 'mortality_count', label: 'Número de aves mortas', type: 'number' }, { name: 'mortality_reason', label: 'Causa presumida', type: 'text' }, { name: 'notes', label: 'Observações', type: 'text' }] },
  water: { title: 'Consumo de água', description: 'Regista o volume consumido e o estado da água por lote.', label: 'Consumo de água', field: 'water_consumption_liters', icon: Droplets, fields: [{ name: 'water_consumption_liters', label: 'Consumo (litros)', type: 'number' }, { name: 'water_quality_status', label: 'Estado da água', type: 'select' }, { name: 'notes', label: 'Observações', type: 'text' }] },
  weight: { title: 'Peso médio', description: 'Acompanha o peso médio e a uniformidade das aves por lote.', label: 'Peso médio', field: 'average_weight_grams', icon: Scale, fields: [{ name: 'average_weight_grams', label: 'Peso médio (g)', type: 'number' }, { name: 'weight_uniformity', label: 'Uniformidade (%)', type: 'number' }, { name: 'notes', label: 'Observações', type: 'text' }] },
} as const

export function DailyManagementEntry({ kind }: { kind: Kind }) {
  const config = settings[kind]
  const Icon = config.icon
  const [rows, setRows] = useState<Row[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [batchId, setBatchId] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [recordData, batchData] = await Promise.all([getClientJson<unknown>(pagedEndpoint('/api/daily-management', 0)), getClientJson<unknown>(pagedEndpoint('/api/batches', 0, 100))])
      setRows(Array.isArray(recordData) ? recordData : [])
      setHasMore(Array.isArray(recordData) && recordData.length === CLIENT_PAGE_SIZE)
      setBatches(Array.isArray(batchData) ? batchData.map((batch: Row) => ({ id: String(batch.id), name: String(batch.name ?? batch.batch_name ?? batch.batch_code ?? batch.id) })) : [])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao carregar os dados.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const page = await getClientJson<unknown>(pagedEndpoint('/api/daily-management', rows.length))
      if (Array.isArray(page)) {
        setRows((current) => [...current, ...page])
        setHasMore(page.length === CLIENT_PAGE_SIZE)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar mais registos.')
    } finally { setLoadingMore(false) }
  }

  const filteredRows = useMemo(() => rows.filter((row) => kind === 'records' ? true : row[config.field] != null), [rows, kind, config.field])
  const batchNames = useMemo(() => new Map(batches.map((batch) => [batch.id, batch.name])), [batches])
  const chartRows = [...filteredRows].reverse().slice(-14).map((row) => ({ date: row.record_date ? new Date(String(row.record_date)).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' }) : 'Sem data', value: Number(row[config.field]) || 0 }))
  const total = filteredRows.reduce((sum, row) => sum + (kind === 'records' ? 1 : Number(row[config.field]) || 0), 0)

  async function save() {
    setError('')
    if (!batchId) { setError('Seleciona um lote antes de guardar.'); return }
    const valueField = config.fields.find((field) => field.name !== 'notes' && field.name !== 'mortality_reason' && field.name !== 'water_quality_status' && field.name !== 'bird_activity' && field.name !== 'feed_consumption_status')
    if (valueField && !values[valueField.name]) { setError(`Preenche o campo “${valueField.label}”.`); return }
    const payload: Row = { batch_id: batchId, record_date: new Date().toISOString().slice(0, 10), ...values }
    for (const field of config.fields) if (field.type === 'number' && values[field.name]) payload[field.name] = Number(values[field.name])
    setSaving(true)
    try {
      const response = await fetch('/api/daily-management', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível guardar o registo.')
      invalidateClientData('/api/daily-management')
      setRows((current) => [result, ...current])
      setValues({}); setBatchId(''); setOpen(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Falha ao guardar o registo.') }
    finally { setSaving(false) }
  }

  return <div className="space-y-6 pb-8">
    <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#283106] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><div className="flex items-center gap-2 text-[#D1D8BD]"><Icon className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Manejo da exploração</span></div><h1 className="mt-2 text-2xl font-bold sm:text-3xl">{config.title}</h1><p className="mt-2 text-sm leading-6 text-[#E0E4D5]">{config.description}</p></div><button onClick={() => { setError(''); setOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D7E6A3] px-4 py-2.5 text-sm font-bold text-[#283106] hover:bg-white"><Plus className="h-4 w-4" />Novo registo</button></section>
    {open && <section className="rounded-xl border border-[#DDE1D2] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-[#283106]">Novo registo</h2><p className="text-sm text-[#727964]">O registo fica associado à data de hoje.</p></div><button onClick={() => setOpen(false)} className="text-sm text-[#727964] hover:text-[#283106]">Fechar</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><label className="space-y-1 text-sm font-medium text-[#384126]">Lote<select value={batchId} onChange={(event) => setBatchId(event.target.value)} className="w-full rounded-lg border border-[#DDE1D2] bg-white px-3 py-2.5"><option value="">Seleciona um lote</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></label>{config.fields.map((field) => <label key={field.name} className="space-y-1 text-sm font-medium text-[#384126]">{field.label}{field.type === 'select' ? <select value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="w-full rounded-lg border border-[#DDE1D2] bg-white px-3 py-2.5"><option value="">Seleciona</option><option>Normal</option><option>Atenção</option><option>Crítico</option></select> : <input type={field.type === 'number' ? 'number' : 'text'} min={field.type === 'number' ? 0 : undefined} step={field.name === 'weight_uniformity' ? '0.1' : 'any'} value={values[field.name] ?? ''} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} className="w-full rounded-lg border border-[#DDE1D2] bg-white px-3 py-2.5" />}</label>)}</div>{error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}<div className="mt-4 flex justify-end"><button disabled={saving || batches.length === 0} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg bg-[#52642B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3D4A2C] disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Guardar registo</button></div>{batches.length === 0 && <p className="mt-2 text-right text-xs text-[#727964]">É necessário criar um lote antes de registar dados de manejo.</p>}</section>}
    <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-[#E2E5D9] bg-white p-5"><p className="text-sm text-[#727964]">{kind === 'records' ? 'Registos disponíveis' : `Total · ${config.label}`}</p><p className="mt-2 text-2xl font-bold text-[#283106]">{loading ? '…' : `${total.toLocaleString('pt-MZ', { maximumFractionDigits: 1 })}${kind === 'water' ? ' L' : kind === 'weight' ? ' g' : kind === 'mortality' ? ' aves' : ''}`}</p></div><div className="rounded-xl border border-[#E2E5D9] bg-white p-5"><p className="text-sm text-[#727964]">Registos neste módulo</p><p className="mt-2 text-2xl font-bold text-[#283106]">{loading ? '…' : filteredRows.length}</p></div></section>
    <section className="rounded-xl border border-[#E2E5D9] bg-white p-5 shadow-sm"><h2 className="mb-3 font-bold text-[#283106]">Evolução registada</h2>{loading ? <p className="py-12 text-center text-sm text-[#727964]">A carregar dados…</p> : chartRows.length === 0 ? <div className="flex min-h-48 items-center justify-center rounded-lg bg-[#FAFBF7] text-sm text-[#727964]">Ainda não existem registos reais para apresentar.</div> : <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartRows}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7DB" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="value" name={config.label} stroke="#687B2A" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>}</section>
    <section className="overflow-hidden rounded-xl border border-[#E2E5D9] bg-white shadow-sm"><div className="border-b border-[#EEF0E9] px-5 py-4"><h2 className="font-bold text-[#283106]">Histórico</h2></div>{loading ? <p className="p-5 text-sm text-[#727964]">A carregar registos…</p> : filteredRows.length === 0 ? <div className="p-8 text-center"><Activity className="mx-auto h-8 w-8 text-[#A0AA82]" /><p className="mt-2 text-sm font-medium text-[#53602E]">Sem registos</p><p className="mt-1 text-xs text-[#727964]">Os dados reais aparecerão aqui depois de serem registados.</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F6F7F3] text-left text-xs uppercase text-[#68734C]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Lote</th><th className="px-4 py-3">{config.label}</th><th className="px-4 py-3">Detalhes</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={String(row.id)} className="border-t border-[#EEF0E9]"><td className="px-4 py-3">{row.record_date ? new Date(String(row.record_date)).toLocaleDateString('pt-MZ') : '—'}</td><td className="px-4 py-3 font-medium">{batchNames.get(String(row.batch_id)) ?? String(row.batch_id ?? '—')}</td><td className="px-4 py-3">{String(row[config.field] ?? '—')}{kind === 'water' ? ' L' : kind === 'weight' ? ' g' : ''}</td><td className="max-w-md px-4 py-3 text-[#727964]">{String(row.notes ?? row.mortality_reason ?? row.water_quality_status ?? row.feed_consumption_status ?? row.bird_activity ?? '—')}</td></tr>)}</tbody></table></div>}</section>
    {hasMore && <div className="flex justify-center"><button onClick={() => void loadMore()} disabled={loadingMore} className="rounded-lg border border-[#DDE1D2] bg-white px-5 py-2.5 text-sm font-semibold text-[#384126] shadow-sm hover:bg-[#F6F7F3] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar registos anteriores'}</button></div>}
  </div>
}
