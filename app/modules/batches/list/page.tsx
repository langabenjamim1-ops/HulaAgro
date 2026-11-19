'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'
import { birdTypeLabel, formatAge, formatDate, formatNumber, statusClass, statusLabel } from '@/lib/batches/labels'

interface Batch {
  id: string
  batch_code: string
  bird_type: string
  birds_count: number
  alive_count?: number
  mortality_rate?: number
  age_days?: number | null
  status: string
  start_date: string
  genetics?: string
}

export default function BatchesListPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateStartFilter, setDateStartFilter] = useState<string>('')
  const [dateEndFilter, setDateEndFilter] = useState<string>('')
  const [birdTypeFilter, setBirdTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    let filtered = batches

    if (statusFilter !== 'all') filtered = filtered.filter(b => b.status === statusFilter)
    if (birdTypeFilter !== 'all') filtered = filtered.filter(b => b.bird_type === birdTypeFilter)
    if (dateStartFilter) filtered = filtered.filter(b => b.start_date.slice(0, 10) >= dateStartFilter)
    if (dateEndFilter) filtered = filtered.filter(b => b.start_date.slice(0, 10) <= dateEndFilter)

    setFilteredBatches(filtered)
  }, [batches, statusFilter, dateStartFilter, dateEndFilter, birdTypeFilter])

  const kpis = useMemo(() => {
    const active = batches.filter(b => b.status === 'active')
    const alive = active.reduce((sum, b) => sum + (b.alive_count ?? b.birds_count), 0)
    const initial = active.reduce((sum, b) => sum + b.birds_count, 0)
    const lost = initial - alive
    return {
      activeCount: active.length,
      alive,
      mortality: initial > 0 ? Math.round((lost / initial) * 10000) / 100 : 0,
    }
  }, [batches])

  async function fetchBatches(offset = 0, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data: unknown = await getClientJson(pagedEndpoint('/api/batches', offset))
      if (Array.isArray(data)) {
        setBatches((current) => append ? [...current, ...data] : data)
        setHasMore(data.length === CLIENT_PAGE_SIZE)
        setActionError('')
      } else {
        console.error('[v0] API response is not an array:', data)
        const message = (data as { error?: string } | null)?.error
        setActionError(message || 'Não foi possível carregar os lotes.')
        setBatches([])
      }
    } catch (error) {
      console.error('[v0] Error fetching batches:', error)
      setActionError(error instanceof Error ? error.message : 'Não foi possível carregar os lotes.')
      setBatches([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/batches/${deleteId}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setActionError(data.error || 'Não foi possível apagar o lote.')
        setDeleteId(null)
        return
      }
      setActionError('')
      invalidateClientData('/api/batches')
      await fetchBatches()
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error deleting batch:', error)
      setActionError('Erro ao apagar o lote. Tente novamente.')
      setDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleEdit(id: string) {
    window.location.href = `/modules/batches/${id}/edit`
  }

  const columns = [
    { key: 'batch_code', label: 'Código do Lote', render: (v: string, row: Batch) => (
      <Link href={`/modules/batches/${row.id}`} className="font-semibold text-[#515062] underline-offset-2 hover:text-[#2FB394] hover:underline">{v}</Link>
    ) },
    { key: 'bird_type', label: 'Tipo de Ave', render: (v: string) => birdTypeLabel(v) },
    { key: 'alive_count', label: 'Aves vivas', render: (_v: number, row: Batch) => (
      <span>
        <strong>{formatNumber(row.alive_count ?? row.birds_count)}</strong>
        <span className="text-[#7D8B89]"> / {formatNumber(row.birds_count)}</span>
      </span>
    ) },
    { key: 'age_days', label: 'Idade', render: (v: number | null) => formatAge(v) },
    { key: 'mortality_rate', label: 'Mortalidade', render: (v: number | undefined) => (
      <span className={(v ?? 0) >= 5 ? 'font-semibold text-red-700' : ''}>{(v ?? 0).toLocaleString('pt-MZ')}%</span>
    ) },
    { key: 'genetics', label: 'Genética' },
    { key: 'status', label: 'Status', render: (v: string) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(v)}`}>{statusLabel(v)}</span>
    ) },
    { key: 'start_date', label: 'Data Início', render: (v: string) => formatDate(v) },
    { key: 'id', label: 'Registos', render: (_v: string, row: Batch) => (
      <Link href={`/modules/batches/${row.id}/registos`} className="font-semibold text-[#2FB394] underline-offset-2 hover:underline">Registos</Link>
    ) },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <PageHeader
          title="Gestão de Lotes"
          description="Visualizar e gerenciar todos os lotes do seu galpão"
        />
        <Link
          href="/modules/batches/create"
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-[#515062] text-white rounded hover:bg-[#3F3E4D] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Novo Lote
        </Link>
      </div>

      {actionError && (
        <div className="flex items-start justify-between gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError('')} className="font-semibold underline">Fechar</button>
        </div>
      )}

      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded border border-[#C9D4D1] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8B89]">Lotes ativos</p>
          <p className="mt-1 text-2xl font-bold text-[#515062]">{formatNumber(kpis.activeCount)}</p>
        </div>
        <div className="rounded border border-[#C9D4D1] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8B89]">Aves vivas (lotes ativos)</p>
          <p className="mt-1 text-2xl font-bold text-[#515062]">{formatNumber(kpis.alive)}</p>
        </div>
        <div className="rounded border border-[#C9D4D1] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7D8B89]">Mortalidade acumulada</p>
          <p className="mt-1 text-2xl font-bold text-[#515062]">{kpis.mortality.toLocaleString('pt-MZ')}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#C9D4D1] p-4 rounded space-y-3 sm:space-y-0">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#515062]" />
          <span className="text-sm font-semibold text-[#515062]">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#515062] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C9D4D1] rounded text-sm text-[#515062] bg-white hover:border-[#7D8B89] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="finished">Finalizado</option>
              <option value="ended">Culminado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#515062] mb-1">Tipo de Ave</label>
            <select
              value={birdTypeFilter}
              onChange={(e) => setBirdTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C9D4D1] rounded text-sm text-[#515062] bg-white hover:border-[#7D8B89] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="layers">Postura</option>
              <option value="broilers">Corte</option>
              <option value="breeders">Reprodução</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#515062] mb-1">Data Início</label>
            <input
              type="date"
              value={dateStartFilter}
              onChange={(e) => setDateStartFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C9D4D1] rounded text-sm text-[#515062] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#515062] mb-1">Data Fim</label>
            <input
              type="date"
              value={dateEndFilter}
              onChange={(e) => setDateEndFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C9D4D1] rounded text-sm text-[#515062] bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              setStatusFilter('all')
              setBirdTypeFilter('all')
              setDateStartFilter('')
              setDateEndFilter('')
            }}
            className="text-xs text-[#7D8B89] hover:text-[#515062] transition-colors underline"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <CRUDTable
        columns={columns}
        data={filteredBatches}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        loading={loading}
      />
      {hasMore && <div className="flex justify-center"><button onClick={() => void fetchBatches(batches.length, true)} disabled={loadingMore} className="rounded-lg border border-[#E2E8E6] bg-white px-5 py-2 text-sm font-semibold text-[#5F5E73] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar mais lotes'}</button></div>}

      {filteredBatches.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-[#7D8B89] text-sm">Nenhum lote encontrado com os filtros selecionados</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Apagar Lote"
        message="Só é possível apagar lotes sem registos associados (produção, sanidade, custos, baixas...). Para guardar o histórico, abra o lote e use «Terminar lote». Deseja tentar apagar?"
        confirmText="Apagar"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}