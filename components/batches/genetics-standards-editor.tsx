'use client'

import { useCallback, useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'

type Metric = 'weight_g' | 'laying_rate' | 'slaughter_weight_g'
type Genetic = { id: string; genetic_name: string; bird_type: string | null }
type Std = { metric: Metric; age_days: number; value: number }
type Unit = 'days' | 'weeks'

const input = 'w-full rounded-lg border border-[#E2E8E6] bg-white px-3 py-2.5 text-sm'
const label = 'space-y-1 text-sm font-medium text-[#5F5E73]'

const TITLES: Record<Metric, { title: string; valueLabel: string; help: string }> = {
  laying_rate: { title: 'Postura alvo', valueLabel: '% de postura', help: 'Uma linha por idade: «idade valor». Ex.: 21 5  ·  22 18,5  ·  23 38' },
  weight_g: { title: 'Peso alvo', valueLabel: 'Peso (g)', help: 'Uma linha por idade: «idade peso em gramas». Ex.: 7 190  ·  14 480' },
  slaughter_weight_g: { title: 'Peso de abate', valueLabel: 'Peso de abate (g)', help: '' },
}

function metricsFor(birdType: string | null): Metric[] {
  if (birdType === 'layers' || birdType === 'breeders') return ['laying_rate', 'weight_g']
  if (birdType === 'broilers') return ['weight_g', 'slaughter_weight_g']
  return ['laying_rate', 'weight_g', 'slaughter_weight_g']
}

function parse(text: string, unit: Unit) {
  const rows: Array<{ age_days: number; value: number }> = []
  const errors: string[] = []
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  lines.forEach((line, index) => {
    const tokens = line.split(/[;\t ]+/).filter(Boolean)
    const age = Number(tokens[0]?.replace(',', '.'))
    if (index === 0 && Number.isNaN(age)) return // cabeçalho da tabela copiada
    const value = Number(tokens[1]?.replace(',', '.'))
    if (tokens.length !== 2 || Number.isNaN(age) || Number.isNaN(value)) { errors.push(`Linha ${index + 1}: use «idade valor».`); return }
    if (!Number.isInteger(age) || age < 0) { errors.push(`Linha ${index + 1}: a idade tem de ser um número inteiro.`); return }
    rows.push({ age_days: unit === 'weeks' ? age * 7 : age, value })
  })
  return { rows, errors }
}

const toText = (rows: Std[], unit: Unit) => rows.map((row) => `${unit === 'weeks' ? row.age_days / 7 : row.age_days}\t${String(row.value).replace('.', ',')}`).join('\n')

function MetricEditor({ geneticsId, metric, rows, defaultUnit, onSaved }: { geneticsId: string; metric: Metric; rows: Std[]; defaultUnit: Unit; onSaved: () => Promise<void> }) {
  const canWeeks = rows.every((row) => row.age_days % 7 === 0)
  const [unit, setUnit] = useState<Unit>(rows.length && !canWeeks ? 'days' : defaultUnit)
  const [text, setText] = useState(() => toText(rows, rows.length && !canWeeks ? 'days' : defaultUnit))
  const [single, setSingle] = useState(rows[0] ? String(rows[0].value) : '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const meta = TITLES[metric]

  async function send(payload: Array<{ age_days: number; value: number }>) {
    setSaving(true); setMessage(null)
    try {
      const response = await fetch(`/api/genetics/${geneticsId}/standards`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metric, rows: payload }) })
      const data: unknown = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível guardar.'))
      setMessage({ ok: true, text: payload.length ? `Guardado (${payload.length} ${payload.length === 1 ? 'valor' : 'valores'}).` : 'Valores apagados.' })
      await onSaved()
    } catch (cause) {
      setMessage({ ok: false, text: cause instanceof Error ? cause.message : 'Falha ao guardar.' })
    } finally { setSaving(false) }
  }

  function saveTable() {
    const { rows: parsed, errors } = parse(text, unit)
    if (errors.length) { setMessage({ ok: false, text: errors.slice(0, 3).join(' ') }); return }
    void send(parsed)
  }
  function saveSingle() {
    const value = Number(single.replace(',', '.'))
    if (single.trim() === '') { void send([]); return }
    if (!Number.isFinite(value) || value <= 0) { setMessage({ ok: false, text: 'Indique o peso em gramas.' }); return }
    void send([{ age_days: 0, value }])
  }

  return <section className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm">
    <h3 className="mb-3 font-bold text-[#515062]">{meta.title}</h3>
    {metric === 'slaughter_weight_g' ? <div className="flex flex-wrap items-end gap-3">
      <label className={`${label} w-48`}>{meta.valueLabel}<input type="text" inputMode="decimal" value={single} onChange={(e) => setSingle(e.target.value)} className={input} placeholder="Ex.: 2200" /></label>
      <button disabled={saving} onClick={saveSingle} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F5E73] disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Guardar</button>
    </div> : <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#5F5E73]">A idade está em
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="rounded-lg border border-[#E2E8E6] bg-white px-2 py-1.5 text-sm"><option value="weeks">semanas</option><option value="days">dias</option></select>
          </label>
          <span className="text-xs text-[#7D8B89]">{meta.help}</span>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} spellCheck={false} placeholder={`Cole aqui a tabela do manual (idade e ${meta.valueLabel.toLowerCase()})`} className={`${input} font-mono`} />
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} onClick={saveTable} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F5E73] disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Guardar tabela</button>
          <span className="text-xs text-[#7D8B89]">Substitui os valores atuais. Deixe vazio e guarde para apagar.</span>
        </div>
      </div>
      <div className="max-h-64 overflow-auto rounded-lg border border-[#EEF2F1]">
        {rows.length === 0 ? <p className="p-4 text-sm text-[#7D8B89]">Ainda sem valores.</p> : <table className="w-full text-xs"><thead className="sticky top-0 bg-[#F9F9F9] text-left uppercase text-[#7D8B89]"><tr><th className="px-3 py-2">Dias</th><th className="px-3 py-2">Sem.</th><th className="px-3 py-2">{metric === 'laying_rate' ? '%' : 'g'}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.age_days} className="border-t border-[#EEF2F1]"><td className="px-3 py-1.5">{row.age_days}</td><td className="px-3 py-1.5">{Number((row.age_days / 7).toFixed(1))}</td><td className="px-3 py-1.5">{row.value.toLocaleString('pt-MZ')}</td></tr>)}</tbody></table>}
      </div>
    </div>}
    {message && <p role={message.ok ? 'status' : 'alert'} className={`mt-3 rounded-lg p-2.5 text-sm ${message.ok ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>{message.text}</p>}
  </section>
}

export function GeneticsStandardsEditor() {
  const [genetics, setGenetics] = useState<Genetic[]>([])
  const [selected, setSelected] = useState('')
  const [rows, setRows] = useState<Std[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRows, setLoadingRows] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/genetics', { cache: 'no-store' })
      .then(async (response) => {
        const data: unknown = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível carregar as linhagens.'))
        setGenetics(Array.isArray(data) ? (data as Genetic[]) : [])
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Falha ao carregar as linhagens.'))
      .finally(() => setLoading(false))
  }, [])

  const loadRows = useCallback(async (id: string) => {
    if (!id) { setRows([]); return }
    setLoadingRows(true)
    try {
      const response = await fetch(`/api/genetics/${id}/standards`, { cache: 'no-store' })
      const data: unknown = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível carregar os padrões.'))
      setRows(Array.isArray(data) ? (data as Std[]).map((row) => ({ ...row, age_days: Number(row.age_days), value: Number(row.value) })) : [])
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar os padrões.')
    } finally { setLoadingRows(false) }
  }, [])

  useEffect(() => { void loadRows(selected) }, [selected, loadRows])

  const current = genetics.find((item) => item.id === selected)

  return <div className="space-y-6 pb-8">
    <p className="rounded-lg bg-[#F9F9F9] p-3 text-sm text-[#7D8B89]">Preencha com os valores do manual do fabricante da linhagem. O sistema não traz curvas prontas: variam por linhagem e por versão do manual. A idade de cada valor vale até ao valor seguinte.</p>
    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {loading ? <p className="text-sm text-[#7D8B89]">A carregar…</p> : genetics.length === 0 ? <p className="rounded-xl border border-[#E2E8E6] bg-white p-6 text-center text-sm text-[#7D8B89]">Ainda não há linhagens. Registe-as primeiro em Configuração → Genéticas.</p> : <>
      <label className={`${label} block max-w-md`}>Linhagem
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={input}><option value="">Escolha a linhagem</option>{genetics.map((item) => <option key={item.id} value={item.id}>{item.genetic_name}</option>)}</select>
      </label>
      {selected && (loadingRows ? <p className="text-sm text-[#7D8B89]">A carregar padrões…</p> : <div className="space-y-4">
        {metricsFor(current?.bird_type ?? null).map((metric) => (
          <MetricEditor key={`${selected}-${metric}-${rows.filter((row) => row.metric === metric).length}`} geneticsId={selected} metric={metric}
            rows={rows.filter((row) => row.metric === metric)} defaultUnit={metric === 'laying_rate' || current?.bird_type === 'layers' || current?.bird_type === 'breeders' ? 'weeks' : 'days'} onSaved={() => loadRows(selected)} />
        ))}
      </div>)}
    </>}
  </div>
}