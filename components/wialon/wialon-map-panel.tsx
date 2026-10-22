'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Gauge, MapPin, RefreshCw, Satellite, Wifi, WifiOff } from 'lucide-react'
import type { WialonUnit } from '@/lib/wialon-types'
import { getClientJson, invalidateClientData } from '@/lib/client-data'

const WialonMap = dynamic(() => import('./wialon-map'), { ssr: false })

export default function WialonMapPanel({ endpoint = '/api/wialon/units' }: { endpoint?: string }) {
  const [units, setUnits] = useState<WialonUnit[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadUnits = useCallback(async (refresh = false) => {
    try {
      setLoading(true)
      if (refresh) invalidateClientData(endpoint)
      const url = refresh && endpoint.includes('full=1') ? `${endpoint}&refresh=1` : endpoint
      const data = await getClientJson<{ ok: boolean; error?: string; units?: WialonUnit[]; updatedAt?: string }>(url)

      if (!data.ok) {
        throw new Error(data.error || 'Não foi possível consultar o Wialon')
      }

      setUnits(Array.isArray(data.units) ? data.units : [])
      setLastUpdate(data.updatedAt ? new Date(data.updatedAt) : new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar Wialon')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    loadUnits()
    const interval = window.setInterval(loadUnits, 15000)
    return () => window.clearInterval(interval)
  }, [loadUnits])

  const online = useMemo(() => units.filter((unit) => unit.connected).length, [units])
  const sensorCount = useMemo(
    () => units.reduce((total, unit) => total + unit.sensors.length, 0),
    [units]
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-[#C7C2AB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E3E0D5] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#777E5C]" />
            <h3 className="font-montserrat text-sm font-bold text-[#283106]">
              Monitorização Wialon
            </h3>
          </div>
          <p className="mt-1 text-[11px] text-[#777E5C]">
            Dispositivos, localização e sensores em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F5F4F1] px-2.5 py-1 text-[10px] font-semibold text-[#53602E]">
            <Wifi className="h-3.5 w-3.5" />
            {online}/{units.length} online
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#F5F4F1] px-2.5 py-1 text-[10px] font-semibold text-[#53602E]">
            <Activity className="h-3.5 w-3.5" />
            {sensorCount} sensores
          </div>
          <button
            onClick={() => void loadUnits(true)}
            disabled={loading}
            className="rounded-lg border border-[#D8D5C8] p-2 text-[#53602E] transition hover:bg-[#F5F4F1] disabled:opacity-50"
            title="Atualizar Wialon"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex min-h-[380px] items-center justify-center p-6">
          <div className="max-w-lg text-center">
            <WifiOff className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <h4 className="font-semibold text-[#283106]">Wialon não conectado</h4>
            <p className="mt-2 text-xs leading-5 text-[#777E5C]">{error}</p>
            <p className="mt-3 rounded-lg bg-[#F5F4F1] p-3 text-left text-[11px] text-[#53602E]">
              Configure <b>WIALON_TOKEN</b> e, se necessário, <b>WIALON_API_HOST</b> nas
              variáveis de ambiente do projeto.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-[440px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative min-h-[440px] bg-slate-100">
            <WialonMap
              units={units}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
            />
            {lastUpdate && (
              <div className="absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#53602E] shadow">
                Atualizado {lastUpdate.toLocaleTimeString('pt-PT')}
              </div>
            )}
          </div>

          <div className="max-h-[440px] overflow-y-auto border-t border-[#E3E0D5] bg-[#FCFCFA] lg:border-l lg:border-t-0">
            <div className="border-b border-[#E3E0D5] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[#283106]">
                  Dispositivos
                </span>
                <span className="text-[10px] text-[#777E5C]">{units.length} unidades</span>
              </div>
            </div>

            {units.length === 0 && !loading ? (
              <div className="p-6 text-center text-xs text-[#777E5C]">
                Nenhuma unidade disponível no Wialon.
              </div>
            ) : (
              <div className="divide-y divide-[#ECE9DF]">
                {units.map((unit) => {
                  const selected = unit.id === selectedUnitId
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`w-full px-4 py-3 text-left transition ${
                        selected ? 'bg-[#EFF1E8]' : 'hover:bg-[#F5F4F1]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                unit.connected ? 'bg-lime-600' : 'bg-red-500'
                              }`}
                            />
                            <span className="truncate text-xs font-bold text-[#283106]">
                              {unit.name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[10px] text-[#777E5C]">
                            <span className="inline-flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              {unit.position?.speed.toFixed(0) ?? '—'} km/h
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Satellite className="h-3 w-3" />
                              {unit.position?.satellites ?? 0}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-[#777E5C]">
                          {unit.sensors.length} sens.
                        </span>
                      </div>

                      {selected && unit.sensors.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          {unit.sensors.slice(0, 6).map((sensor) => (
                            <div key={sensor.id} className="rounded-md bg-white px-2 py-1.5">
                              <div className="truncate text-[9px] text-[#777E5C]">{sensor.name}</div>
                              <div className="truncate text-[10px] font-bold text-[#283106]">
                                {sensor.formattedValue ?? '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
