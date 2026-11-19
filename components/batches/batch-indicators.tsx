'use client'

import { useEffect, useState } from 'react'
import { Activity, Info } from 'lucide-react'
import type { Indicators } from '@/lib/batches/indicators'

type Response = Indicators & {
  genetics: { id: string; name: string } | null
  standards_status: 'ok' | 'no_genetics' | 'no_standards' | 'not_migrated'
  batch: { id: string; batch_code: string; bird_type: string; status: string }
}

const n = (value: number | null | undefined, digits = 0) =>
  value === null || value === undefined ? '—' : value.toLocaleString('pt-MZ', { maximumFractionDigits: digits })
const dateText = (value: string) => { const d = new Date(`${value.slice(0, 10)}T00:00:00`); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-MZ') }
const diffText = (value: number, unit: string) => `${value > 0 ? '+' : ''}${n(value, 1)} ${unit}`

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good' | 'bad' }) {
  return <div className="rounded-xl border border-[#E2E8E6] bg-white p-5">
    <p className="text-sm text-[#7D8B89]">{label}</p>
    <p className="mt-2 text-xl font-bold text-[#515062]">{value}</p>
    {hint && <p className={`mt-1 text-xs ${tone === 'bad' ? 'text-red-600' : tone === 'good' ? 'text-green-700' : 'text-[#7D8B89]'}`}>{hint}</p>}
  </div>
}

export function BatchIndicators({ batchId, refreshKey = 0 }: { batchId: string; refreshKey?: number }) {
  const [data, setData] = useState<Response | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`/api/batches/${batchId}/indicators`, { cache: 'no-store' })
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(String((body as { error?: string }).error || 'Não foi possível calcular os indicadores.'))
        if (active) { setData(body as Response); setError('') }
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Falha ao calcular os indicadores.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [batchId, refreshKey])

  if (loading) return <p className="p-4 text-center text-sm text-[#7D8B89]">A calcular indicadores…</p>
  if (error || !data) return <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error || 'Sem dados.'}</p>

  const { layers, weight, broilers } = data
  const last = layers?.last ?? null
  const rateGap = last?.rate !== null && last?.rate !== undefined && layers?.target_rate !== null && layers?.target_rate !== undefined ? last.rate - layers.target_rate : null
  const nothing = !layers?.last && !weight

  return <section className="space-y-4">
    <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#2FB394]" /><h2 className="font-bold text-[#515062]">Indicadores do lote</h2>{data.genetics && <span className="text-xs text-[#7D8B89]">· {data.genetics.name}</span>}</div>

    {data.notes.length > 0 && <ul className="space-y-1 rounded-lg bg-[#F9F9F9] p-3 text-xs text-[#7D8B89]">
      {data.notes.map((note) => <li key={note} className="flex gap-2"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{note}</li>)}
    </ul>}

    {nothing && <p className="rounded-xl border border-[#E2E8E6] bg-white p-6 text-center text-sm text-[#7D8B89]">Os indicadores aparecem assim que existirem registos de {data.batch.bird_type === 'broilers' ? 'pesagem e ração' : 'postura'} neste lote.</p>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {layers?.last && <>
        <Kpi label={`Postura em ${dateText(layers.last.date)}`} value={layers.last.rate === null ? '—' : `${n(layers.last.rate, 1)}%`}
          hint={rateGap !== null ? `Padrão ${n(layers.target_rate, 1)}% · ${diffText(rateGap, 'p.p.')}` : `${n(layers.last.eggs)} ovos / ${n(layers.last.alive)} aves`} tone={rateGap === null ? undefined : rateGap >= 0 ? 'good' : 'bad'} />
        <Kpi label="Postura (últimos 7 dias)" value={layers.rate_7d === null ? '—' : `${n(layers.rate_7d, 1)}%`} hint="Ovos ÷ aves vivas no início do dia" />
        <Kpi label="Ovos recolhidos" value={n(layers.eggs_total)} hint={layers.broken_pct !== null ? `${n(layers.broken_total)} partidos (${n(layers.broken_pct, 1)}%)` : undefined} />
        <Kpi label="Ração por ave" value={layers.feed.grams_per_bird_day === null ? '—' : `${n(layers.feed.grams_per_bird_day)} g/dia`} hint={layers.feed.kg_per_dozen !== null ? `${n(layers.feed.kg_per_dozen, 2)} kg por dúzia de ovos` : 'Registe a ração diária'} />
        <Kpi label="Custo por ovo" value={layers.cost?.per_egg === null || !layers.cost ? '—' : `${n(layers.cost.per_egg, 2)} ${layers.cost.currency}`} hint={layers.cost ? (layers.cost.feed_per_egg !== null ? `Só ração: ${n(layers.cost.feed_per_egg, 2)} ${layers.cost.currency}` : `Custos do lote: ${n(layers.cost.total)} ${layers.cost.currency}`) : 'Sem custos registados para este lote'} />
      </>}

      {weight && <Kpi label={`Peso médio em ${dateText(weight.last.date)}`} value={`${n(weight.last.grams)} g`}
        hint={weight.last.target !== null && weight.diff_pct !== null ? `Padrão ${n(weight.last.target)} g · ${diffText(weight.diff_pct, '%')}` : weight.last.age_days !== null ? `${weight.last.age_days} dias de idade` : undefined}
        tone={weight.diff_pct === null ? undefined : weight.diff_pct >= 0 ? 'good' : 'bad'} />}

      {broilers && weight && <>
        <Kpi label="Conversão alimentar (aprox.)" value={broilers.fcr === null ? '—' : n(broilers.fcr, 2)} hint={broilers.fcr === null ? 'Precisa de ração e pesagem registadas' : `${n(broilers.feed_total_kg)} kg de ração até à última pesagem`} />
        <Kpi label="Previsão de abate"
          value={broilers.projection === null ? '—' : 'reached' in broilers.projection ? 'Peso atingido' : dateText(broilers.projection.date)}
          hint={broilers.slaughter_target_g === null ? 'Defina o peso de abate nos padrões da linhagem'
            : broilers.projection === null ? `Alvo ${n(broilers.slaughter_target_g)} g · precisa de 2 pesagens com 2 a 14 dias de intervalo`
            : 'reached' in broilers.projection ? `Alvo ${n(broilers.slaughter_target_g)} g` : `Alvo ${n(broilers.slaughter_target_g)} g · em ${broilers.projection.days} dias (+${n(broilers.projection.gain_g_per_day, 1)} g/dia)`} />
      </>}
    </div>

    {layers && layers.series.length > 0 && <div className="overflow-hidden rounded-xl border border-[#E2E8E6] bg-white">
      <div className="border-b border-[#EEF2F1] px-5 py-3 text-sm font-bold text-[#515062]">Postura por dia (soma das recolhas do dia)</div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F9F9F9] text-left text-xs uppercase text-[#7D8B89]"><tr><th className="px-4 py-2">Data</th><th className="px-4 py-2">Ovos</th><th className="px-4 py-2">Partidos</th><th className="px-4 py-2">Aves vivas</th><th className="px-4 py-2">Postura</th></tr></thead>
        <tbody>{[...layers.series].reverse().slice(0, 14).map((row) => <tr key={row.date} className="border-t border-[#EEF2F1]"><td className="px-4 py-2">{dateText(row.date)}</td><td className="px-4 py-2">{n(row.eggs)}</td><td className="px-4 py-2">{n(row.broken)}</td><td className="px-4 py-2">{n(row.alive)}</td><td className="px-4 py-2 font-medium">{row.rate === null ? '—' : `${n(row.rate, 1)}%`}</td></tr>)}</tbody></table></div>
    </div>}
  </section>
}