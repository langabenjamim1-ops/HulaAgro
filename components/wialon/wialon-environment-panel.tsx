'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw, Thermometer } from 'lucide-react'
import type { WialonSensor, WialonUnit } from '@/lib/wialon-types'

type SensorRow = { unit: WialonUnit; sensor: WialonSensor }

export default function WialonEnvironmentPanel() {
  const [units, setUnits] = useState<WialonUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/wialon/units', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.error || 'Não foi possível consultar o Wialon.')
      setUnits(Array.isArray(result.units) ? result.units : [])
      setUpdatedAt(new Date())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar os sensores do Wialon.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), 15000)
    return () => window.clearInterval(timer)
  }, [refresh])

  const rows = useMemo<SensorRow[]>(
    () => units.flatMap((unit) => unit.sensors.map((sensor) => ({ unit, sensor }))),
    [units],
  )
  const ambientRows = useMemo(
    () => rows.filter(({ sensor }) => /temp|hum|ambi|clima|co2|\bnh3\b|am[oô]nia|press[aã]o|luminos|luz|ventila|\bppm\b/i.test(`${sensor.name} ${sensor.parameter} ${sensor.unit}`)),
    [rows],
  )

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#283106] p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white/10 p-3"><Thermometer className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D1D8BD]">Leitura direta do Wialon</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Sensores de ambiência</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#E0E4D5]">Os sensores configurados nas unidades Wialon aparecem aqui automaticamente, com os valores mais recentes.</p>
          </div>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D7E6A3] px-4 py-2.5 text-sm font-bold text-[#283106] hover:bg-white disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar agora
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E2E5D9] bg-white p-5"><p className="text-sm text-[#727964]">Sensores configurados</p><p className="mt-2 text-2xl font-bold text-[#283106]">{loading ? '…' : rows.length}</p></div>
        <div className="rounded-xl border border-[#E2E5D9] bg-white p-5"><p className="text-sm text-[#727964]">Sensores identificados como ambiência</p><p className="mt-2 text-2xl font-bold text-[#283106]">{loading ? '…' : ambientRows.length}</p></div>
        <div className="rounded-xl border border-[#E2E5D9] bg-white p-5"><p className="text-sm text-[#727964]">Unidades Wialon</p><p className="mt-2 text-2xl font-bold text-[#283106]">{loading ? '…' : units.length}</p></div>
      </section>

      {updatedAt && <p className="text-xs text-[#727964]">Atualizado às {updatedAt.toLocaleTimeString('pt-MZ')}</p>}
      {error ? (
        <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</div>
      ) : loading && rows.length === 0 ? (
        <div className="rounded-xl border border-[#E2E5D9] bg-white p-10 text-center text-sm text-[#727964]">A carregar sensores do Wialon…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D8D5C8] bg-white p-10 text-center">
          <Activity className="mx-auto h-8 w-8 text-[#A0AA82]" />
          <p className="mt-3 text-sm font-semibold text-[#53602E]">Ainda não há sensores configurados nas unidades Wialon</p>
          <p className="mt-1 text-sm text-[#727964]">Configure os sensores na unidade correspondente no Wialon e atualize esta página. Eles serão listados aqui automaticamente.</p>
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ unit, sensor }) => (
            <article key={`${unit.id}-${sensor.id}`} className="rounded-xl border border-[#E2E5D9] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-wide text-[#777E5C]">{unit.name}</p>
                  <h2 className="mt-1 truncate font-bold text-[#283106]">{sensor.name}</h2>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${unit.connected ? 'bg-[#EFF1E8] text-[#53602E]' : 'bg-slate-100 text-slate-500'}`}>{unit.connected ? 'Ligada' : 'Sem ligação'}</span>
              </div>
              <p className="mt-5 text-3xl font-bold text-[#283106]">{sensor.formattedValue ?? (sensor.value == null ? '—' : String(sensor.value))}<span className="ml-1 text-sm font-medium text-[#777E5C]">{sensor.unit}</span></p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#777E5C]">
                {sensor.parameter && <span>Parâmetro: {sensor.parameter}</span>}
                {sensor.type && <span>Tipo: {sensor.type}</span>}
              </div>
            </article>
          ))}
        </section>
      )}
      {!error && rows.length > 0 && ambientRows.length === 0 && <p className="rounded-lg bg-[#F5F4F1] p-3 text-xs text-[#53602E]">Ainda não foram identificados sensores de ambiência pelo nome ou pela unidade. Todos os sensores Wialon estão listados acima; ao configurar temperatura, humidade ou outros sensores ambientais, eles serão reconhecidos nesta contagem.</p>}
    </div>
  )
}
