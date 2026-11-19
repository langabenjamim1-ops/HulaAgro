'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import Link from 'next/link'
import { BatchProductionPanel } from '@/components/batches/batch-production-panel'
import { LiveRecordsPage, type LiveColumn } from '@/components/modules/live-records-page'

type Option = { id: string; batch_code: string; alive_count: number }

type Props = {
  birdTypes: string[]
  title: string
  description: string
  endpoint: string
  columns: LiveColumn[]
  emptyMessage: string
}

// Registo de produção dentro da aba Produção: escolhe o lote, regista, e a lista geral atualiza.
export function ProductionEntryPage({ birdTypes, title, description, endpoint, columns, emptyMessage }: Props) {
  const [options, setOptions] = useState<Option[]>([])
  const [batchId, setBatchId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [open, setOpen] = useState(false)
  const [names, setNames] = useState<Record<string, string>>({})
  const typesKey = birdTypes.join(',')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch('/api/batches?limit=100', { cache: 'no-store' })
        const data: unknown = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível carregar os lotes.'))
        const list = (Array.isArray(data) ? data : []) as Array<{ id: string; batch_code: string; bird_type: string; status: string; alive_count?: number; birds_count: number }>
        const allowed = typesKey.split(',')
        const nameMap: Record<string, string> = {}
        for (const batch of list) nameMap[batch.id] = batch.batch_code
        const filtered = list
          .filter((batch) => batch.status === 'active' && allowed.includes(batch.bird_type))
          .map((batch) => ({ id: batch.id, batch_code: batch.batch_code, alive_count: batch.alive_count ?? batch.birds_count }))
        if (cancelled) return
        setNames(nameMap)
        setOptions(filtered)
        setBatchId((current) => current || filtered[0]?.id || '')
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Falha ao carregar os lotes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [typesKey])

  return <div className="space-y-6">
    <div className="flex justify-end">
      <button onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#5F5E73]">
        {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{open ? 'Fechar registo' : 'Novo registo'}
      </button>
    </div>
    {open && <section className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <h2 className="font-bold text-[#515062]">Registar produção</h2>
      <p className="mt-1 text-sm text-[#7D8B89]">Escolha o lote e registe o dia. O registo fica ligado a esse lote.</p>
      {loading ? <p className="mt-4 text-sm text-[#7D8B89]">A carregar lotes…</p> : error ? <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p> : options.length === 0 ? <p className="mt-4 text-sm text-[#7D8B89]">Não há lotes ativos deste tipo. <Link href="/modules/batches/create" className="font-semibold text-[#2FB394] underline">Criar lote</Link></p> : <label className="mt-4 block max-w-sm space-y-1 text-sm font-medium text-[#5F5E73]">Lote
        <select value={batchId} onChange={(event) => setBatchId(event.target.value)} className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3 py-2.5 text-sm">
          {options.map((option) => <option key={option.id} value={option.id}>{option.batch_code} · {option.alive_count} aves vivas</option>)}
        </select>
      </label>}
    </section>}
    {open && batchId && <BatchProductionPanel key={batchId} batchId={batchId} onChange={() => setRefresh((value) => value + 1)} />}
    <LiveRecordsPage key={`${refresh}-${Object.keys(names).length}`} title={title} description={description} endpoint={endpoint} columns={columns} emptyMessage={emptyMessage} valueLabels={{ batch_id: names }} />
  </div>
}