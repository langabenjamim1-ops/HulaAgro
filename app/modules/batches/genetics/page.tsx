'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/common/page-header'
import { invalidateClientData } from '@/lib/client-data'
import { birdTypeLabel, formatDate, statusClass, statusLabel } from '@/lib/batches/labels'

interface Batch {
  id: string
  batch_code: string
  bird_type: string
  status: string
  start_date: string
  genetics?: string | null
}

interface Genetic {
  id: string
  genetic_name: string
  bird_type: string | null
  category: string | null
}

const appliesTo = (genetic: Genetic, birdType: string) =>
  birdType === 'breeders' || !genetic.bird_type || genetic.bird_type === birdType

export default function AssociateGeneticsPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [genetics, setGenetics] = useState<Genetic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [onlyMissing, setOnlyMissing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [batchResponse, geneticResponse] = await Promise.all([
        fetch('/api/batches?limit=100&offset=0', { cache: 'no-store' }),
        fetch('/api/genetics', { cache: 'no-store' }),
      ])
      const batchData = await batchResponse.json().catch(() => ({}))
      const geneticData = await geneticResponse.json().catch(() => ({}))
      if (!batchResponse.ok) throw new Error(batchData.error || 'Não foi possível carregar os lotes.')
      if (!geneticResponse.ok) throw new Error(geneticData.error || 'Não foi possível carregar as genéticas.')
      setBatches(Array.isArray(batchData) ? batchData : [])
      setGenetics(Array.isArray(geneticData) ? geneticData : [])
      setError('')
    } catch (err) {
      console.error('[v0] Error loading genetics association:', err)
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const missing = useMemo(() => batches.filter((batch) => !batch.genetics).length, [batches])
  const rows = onlyMissing ? batches.filter((batch) => !batch.genetics) : batches

  async function associate(batch: Batch, value: string) {
    try {
      setSavingId(batch.id)
      setSavedId(null)
      setError('')
      const response = await fetch(`/api/batches/${batch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genetics: value }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível associar a genética.')
      setBatches((current) => current.map((item) => (item.id === batch.id ? { ...item, genetics: value || null } : item)))
      invalidateClientData('/api/batches')
      invalidateClientData('/api/genetics')
      setSavedId(batch.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível associar a genética.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <PageHeader title="Genética dos lotes" description="Associe uma genética do catálogo a cada lote." />

      {error && (
        <div className="flex items-start justify-between gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="font-semibold underline">Fechar</button>
        </div>
      )}

      {!loading && genetics.length === 0 && (
        <div className="rounded border border-[#C9D4D1] bg-white px-4 py-3 text-sm text-[#515062]">
          Ainda não há genéticas registadas. <Link href="/modules/configuration/genetics" className="font-semibold underline">Registe ou importe o catálogo</Link> para poder associar.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#515062]">
          {missing > 0 ? <><strong>{missing}</strong> lote(s) sem genética associada.</> : 'Todos os lotes têm genética associada.'}
        </p>
        <label className="flex items-center gap-2 text-sm text-[#515062]">
          <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
          Mostrar só os que faltam
        </label>
      </div>

      <div className="overflow-hidden rounded border border-[#C9D4D1] bg-white">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-[#7D8B89]">A carregar…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#7D8B89]">Nenhum lote para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#F9F9F9] text-left text-xs font-bold uppercase tracking-wide text-[#7D8B89]">
                <tr><th className="px-4 py-3">Lote</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Entrada</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Genética</th></tr>
              </thead>
              <tbody>
                {rows.map((batch) => {
                  const options = genetics.filter((genetic) => appliesTo(genetic, batch.bird_type))
                  const current = batch.genetics || ''
                  const inList = !current || options.some((genetic) => genetic.genetic_name === current)
                  return (
                    <tr key={batch.id} className="border-t border-[#EEF2F1] text-[#515062]">
                      <td className="px-4 py-3"><Link href={`/modules/batches/${batch.id}`} className="font-semibold hover:text-[#2FB394] hover:underline">{batch.batch_code}</Link></td>
                      <td className="px-4 py-3">{birdTypeLabel(batch.bird_type)}</td>
                      <td className="px-4 py-3">{formatDate(batch.start_date)}</td>
                      <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(batch.status)}`}>{statusLabel(batch.status)}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={current}
                            disabled={savingId === batch.id}
                            onChange={(e) => void associate(batch, e.target.value)}
                            className="w-full min-w-[200px] rounded border border-[#C9D4D1] bg-white px-3 py-2 text-sm text-[#515062] focus:border-[#7D8B89] focus:outline-none"
                          >
                            <option value="">Sem genética</option>
                            {!inList && <option value={current}>{current} (fora do catálogo)</option>}
                            {options.map((genetic) => <option key={genetic.id} value={genetic.genetic_name}>{genetic.genetic_name}</option>)}
                          </select>
                          <span className="w-16 text-xs text-[#2FB394]">{savingId === batch.id ? 'A guardar…' : savedId === batch.id ? 'Guardado' : ''}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}