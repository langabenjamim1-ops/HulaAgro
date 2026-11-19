'use client'

import { useCallback, useEffect, useState } from 'react'
import { Egg, LoaderCircle, Scale, Trash2 } from 'lucide-react'
import { invalidateClientData } from '@/lib/client-data'
import { birdTypeLabel, formatNumber } from '@/lib/batches/labels'

type Batch = { id: string; batch_code: string; bird_type: string; birds_count: number; alive_count: number; mortality_total: number; status: string }
type ProductionRow = {
  id: string; record_date: string; record_kind: string | null
  eggs_produced: number | null; eggs_broken: number | null; feed_consumption: number | null; water_consumption: number | null
  average_weight: number | null; sample_size: number | null; mortality_count: number | null; notes: string | null
}

const today = () => new Date().toISOString().slice(0, 10)
const input = 'w-full rounded-lg border border-[#E2E8E6] bg-white px-3 py-2.5 text-sm'
const label = 'space-y-1 text-sm font-medium text-[#5F5E73]'
const dateText = (value: string) => { const d = new Date(`${String(value).slice(0, 10)}T00:00:00`); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-MZ') }
const num = (value: number | null | undefined, unit = '') => (value === null || value === undefined ? '—' : `${Number(value).toLocaleString('pt-MZ', { maximumFractionDigits: 2 })}${unit}`)

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>
}

export function BatchProductionPanel({ batchId, onChange }: { batchId: string; onChange?: () => void }) {
  const [batch, setBatch] = useState<Batch | null>(null)
  const [rows, setRows] = useState<ProductionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState<'daily' | 'weighing' | null>(null)
  const [daily, setDaily] = useState({ record_date: today(), eggs_produced: '', eggs_broken: '', feed_consumption: '', water_consumption: '', mortality_count: '', mortality_reason: '', notes: '' })
  const [weighing, setWeighing] = useState({ record_date: today(), average_weight: '', sample_size: '', notes: '' })

  const load = useCallback(async () => {
    setError('')
    try {
      const [batchResponse, rowsResponse] = await Promise.all([
        fetch(`/api/batches/${batchId}`, { cache: 'no-store' }),
        fetch(`/api/production?batch_id=${batchId}&limit=100`, { cache: 'no-store' }),
      ])
      const batchData = await readJson(batchResponse)
      if (!batchResponse.ok) throw new Error(String(batchData.error || 'Não foi possível carregar o lote.'))
      const rowsData: unknown = await rowsResponse.json().catch(() => ({}))
      if (!rowsResponse.ok) throw new Error(String((rowsData as { error?: string }).error || 'Não foi possível carregar os registos.'))
      setBatch(batchData as unknown as Batch)
      setRows(Array.isArray(rowsData) ? (rowsData as ProductionRow[]) : [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar os dados do lote.')
    } finally {
      setLoading(false)
    }
  }, [batchId])

  useEffect(() => { void load() }, [load])

  async function submit(kind: 'daily' | 'weighing') {
    setError(''); setNotice('')
    const payload = kind === 'daily' ? { ...daily } : { ...weighing }
    setSaving(kind)
    try {
      const response = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, record_kind: kind, batch_id: batchId }),
      })
      const data = await readJson(response)
      if (!response.ok) throw new Error(String(data.error || 'Não foi possível guardar o registo.'))
      invalidateClientData('/api/production')
      if (kind === 'daily') setDaily({ record_date: today(), eggs_produced: '', eggs_broken: '', feed_consumption: '', water_consumption: '', mortality_count: '', mortality_reason: '', notes: '' })
      else setWeighing({ record_date: today(), average_weight: '', sample_size: '', notes: '' })
      setNotice(kind === 'daily' ? 'Registo diário guardado.' : 'Pesagem guardada.')
      await load()
      onChange?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao guardar o registo.')
    } finally {
      setSaving(null)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Apagar este registo? Se tiver mortalidade, essas aves voltam a contar como vivas. Esta ação não pode ser desfeita.')) return
    setError(''); setNotice('')
    try {
      const response = await fetch(`/api/production/${id}`, { method: 'DELETE' })
      const data = await readJson(response)
      if (!response.ok) throw new Error(String(data.error || 'Não foi possível apagar o registo.'))
      invalidateClientData('/api/production')
      await load()
      onChange?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao apagar o registo.')
    }
  }

  if (loading) return <p className="p-8 text-center text-sm text-[#7D8B89]">A carregar…</p>
  if (!batch) return <div role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{error || 'Lote não encontrado.'}</div>

  const layer = batch.bird_type === 'layers' || batch.bird_type === 'breeders'
  const active = batch.status === 'active'
  const dailyRows = rows.filter((row) => row.record_kind === 'daily')
  const weighingRows = rows.filter((row) => row.record_kind === 'weighing')

  return <div className="space-y-6 pb-8">
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-[#E2E8E6] bg-white p-5"><p className="text-sm text-[#7D8B89]">Lote</p><p className="mt-2 text-xl font-bold text-[#515062]">{batch.batch_code}</p><p className="text-xs text-[#7D8B89]">{birdTypeLabel(batch.bird_type)}</p></div>
      <div className="rounded-xl border border-[#E2E8E6] bg-white p-5"><p className="text-sm text-[#7D8B89]">Aves vivas</p><p className="mt-2 text-xl font-bold text-[#515062]">{formatNumber(batch.alive_count)} <span className="text-sm font-normal text-[#7D8B89]">/ {formatNumber(batch.birds_count)}</span></p></div>
      <div className="rounded-xl border border-[#E2E8E6] bg-white p-5"><p className="text-sm text-[#7D8B89]">Mortes registadas</p><p className="mt-2 text-xl font-bold text-[#515062]">{formatNumber(batch.mortality_total)}</p><p className="text-xs text-[#7D8B89]">Registe-as no registo diário abaixo.</p></div>
    </section>

    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {!active && <p className="rounded-lg bg-[#F9F9F9] p-3 text-sm text-[#7D8B89]">Este lote já não está ativo: só pode consultar os registos.</p>}

    {active && <section className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><Egg className="h-4 w-4 text-[#2FB394]" /><h2 className="font-bold text-[#515062]">{layer ? 'Registo diário de postura' : 'Registo diário de consumo'}</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className={label}>Data<input type="date" max={today()} value={daily.record_date} onChange={(e) => setDaily({ ...daily, record_date: e.target.value })} className={input} /></label>
        {layer && <label className={label}>Ovos recolhidos<input type="number" min={0} step={1} value={daily.eggs_produced} onChange={(e) => setDaily({ ...daily, eggs_produced: e.target.value })} className={input} /></label>}
        {layer && <label className={label}>Ovos partidos<input type="number" min={0} step={1} value={daily.eggs_broken} onChange={(e) => setDaily({ ...daily, eggs_broken: e.target.value })} className={input} /></label>}
        <label className={label}>Ração (kg)<input type="number" min={0} step="any" value={daily.feed_consumption} onChange={(e) => setDaily({ ...daily, feed_consumption: e.target.value })} className={input} /></label>
        <label className={label}>Água (litros)<input type="number" min={0} step="any" value={daily.water_consumption} onChange={(e) => setDaily({ ...daily, water_consumption: e.target.value })} className={input} /></label>
        <label className={label}>Aves mortas<input type="number" min={0} step={1} value={daily.mortality_count} onChange={(e) => setDaily({ ...daily, mortality_count: e.target.value })} className={input} /></label>
        <label className={label}>Causa presumida<input type="text" value={daily.mortality_reason} onChange={(e) => setDaily({ ...daily, mortality_reason: e.target.value })} className={input} /></label>
        <label className={label}>Observações<input type="text" value={daily.notes} onChange={(e) => setDaily({ ...daily, notes: e.target.value })} className={input} /></label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={saving !== null} onClick={() => void submit('daily')} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F5E73] disabled:opacity-50">{saving === 'daily' && <LoaderCircle className="h-4 w-4 animate-spin" />}Guardar registo diário</button></div>
    </section>}

    {active && <section className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2"><Scale className="h-4 w-4 text-[#2FB394]" /><h2 className="font-bold text-[#515062]">Pesagem</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className={label}>Data<input type="date" max={today()} value={weighing.record_date} onChange={(e) => setWeighing({ ...weighing, record_date: e.target.value })} className={input} /></label>
        <label className={label}>Peso médio (g)<input type="number" min={1} step="any" value={weighing.average_weight} onChange={(e) => setWeighing({ ...weighing, average_weight: e.target.value })} className={input} /></label>
        <label className={label}>Aves pesadas<input type="number" min={1} step={1} value={weighing.sample_size} onChange={(e) => setWeighing({ ...weighing, sample_size: e.target.value })} className={input} /></label>
        <label className={`${label} sm:col-span-2 xl:col-span-3`}>Observações<input type="text" value={weighing.notes} onChange={(e) => setWeighing({ ...weighing, notes: e.target.value })} className={input} /></label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={saving !== null} onClick={() => void submit('weighing')} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F5E73] disabled:opacity-50">{saving === 'weighing' && <LoaderCircle className="h-4 w-4 animate-spin" />}Guardar pesagem</button></div>
    </section>}

    <section className="overflow-hidden rounded-xl border border-[#E2E8E6] bg-white shadow-sm">
      <div className="border-b border-[#EEF2F1] px-5 py-4"><h2 className="font-bold text-[#515062]">Registos diários</h2></div>
      {dailyRows.length === 0 ? <p className="p-6 text-center text-sm text-[#7D8B89]">Ainda não há registos diários neste lote.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F9F9F9] text-left text-xs uppercase text-[#7D8B89]"><tr><th className="px-4 py-3">Data</th>{layer && <th className="px-4 py-3">Ovos</th>}{layer && <th className="px-4 py-3">Partidos</th>}<th className="px-4 py-3">Ração</th><th className="px-4 py-3">Água</th><th className="px-4 py-3">Mortes</th><th className="px-4 py-3">Observações</th><th className="px-4 py-3" /></tr></thead><tbody>{dailyRows.map((row) => <tr key={row.id} className="border-t border-[#EEF2F1]"><td className="px-4 py-3">{dateText(row.record_date)}</td>{layer && <td className="px-4 py-3">{num(row.eggs_produced)}</td>}{layer && <td className="px-4 py-3">{num(row.eggs_broken)}</td>}<td className="px-4 py-3">{num(row.feed_consumption, ' kg')}</td><td className="px-4 py-3">{num(row.water_consumption, ' L')}</td><td className="px-4 py-3">{num(row.mortality_count)}</td><td className="max-w-xs px-4 py-3 text-[#7D8B89]">{row.notes || '—'}</td><td className="px-4 py-3 text-right">{active && <button aria-label="Apagar registo" onClick={() => void remove(row.id)} className="text-[#98ABA9] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td></tr>)}</tbody></table></div>}
    </section>

    <section className="overflow-hidden rounded-xl border border-[#E2E8E6] bg-white shadow-sm">
      <div className="border-b border-[#EEF2F1] px-5 py-4"><h2 className="font-bold text-[#515062]">Pesagens</h2></div>
      {weighingRows.length === 0 ? <p className="p-6 text-center text-sm text-[#7D8B89]">Ainda não há pesagens neste lote.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F9F9F9] text-left text-xs uppercase text-[#7D8B89]"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Peso médio</th><th className="px-4 py-3">Aves pesadas</th><th className="px-4 py-3">Observações</th><th className="px-4 py-3" /></tr></thead><tbody>{weighingRows.map((row) => <tr key={row.id} className="border-t border-[#EEF2F1]"><td className="px-4 py-3">{dateText(row.record_date)}</td><td className="px-4 py-3">{num(row.average_weight, ' g')}</td><td className="px-4 py-3">{num(row.sample_size)}</td><td className="max-w-xs px-4 py-3 text-[#7D8B89]">{row.notes || '—'}</td><td className="px-4 py-3 text-right">{active && <button aria-label="Apagar pesagem" onClick={() => void remove(row.id)} className="text-[#98ABA9] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td></tr>)}</tbody></table></div>}
    </section>
  </div>
}