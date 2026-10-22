'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

interface Batch {
  id: string
  batch_code: string
  bird_type: string
  birds_count: number
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
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateStartFilter, setDateStartFilter] = useState<string>('')
  const [dateEndFilter, setDateEndFilter] = useState<string>('')
  const [birdTypeFilter, setBirdTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = batches

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Bird type filter
    if (birdTypeFilter !== 'all') {
      filtered = filtered.filter(b => b.bird_type === birdTypeFilter)
    }

    // Date range filter
    if (dateStartFilter) {
      filtered = filtered.filter(b => new Date(b.start_date) >= new Date(dateStartFilter))
    }

    if (dateEndFilter) {
      filtered = filtered.filter(b => new Date(b.start_date) <= new Date(dateEndFilter))
    }

    setFilteredBatches(filtered)
  }, [batches, statusFilter, dateStartFilter, dateEndFilter, birdTypeFilter])

  async function fetchBatches(offset = 0, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data: unknown = await getClientJson(pagedEndpoint('/api/batches', offset))
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setBatches((current) => append ? [...current, ...data] : data)
        setHasMore(data.length === CLIENT_PAGE_SIZE)
      } else {
        console.error('[v0] API response is not an array:', data)
        setBatches([])
      }
    } catch (error) {
      console.error('[v0] Error fetching batches:', error)
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
      const response = await fetch(`/api/batches/${deleteId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      invalidateClientData('/api/batches')
      await fetchBatches()
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error deleting batch:', error)
      alert('Erro ao deletar lote')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleEdit(id: string) {
    window.location.href = `/modules/batches/${id}/edit`
  }

  const columns = [
    { key: 'batch_code', label: 'Código do Lote' },
    { key: 'bird_type', label: 'Tipo de Ave' },
    { key: 'birds_count', label: 'Quantidade', render: (v: number) => v.toLocaleString('pt-MZ') },
    { key: 'genetics', label: 'Genética' },
    { key: 'status', label: 'Status', render: (v: string) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        v === 'active' ? 'bg-green-100 text-green-800' :
        v === 'finished' ? 'bg-blue-100 text-blue-800' :
        'bg-red-100 text-red-800'
      }`}>
        {v === 'active' ? 'Ativo' : v === 'finished' ? 'Finalizado' : 'Culminado'}
      </span>
    ) },
    { key: 'start_date', label: 'Data Início', render: (v: string) => new Date(v).toLocaleDateString('pt-MZ') },
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
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Novo Lote
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#C7C2AB] p-4 rounded space-y-3 sm:space-y-0">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#283106]" />
          <span className="text-sm font-semibold text-[#283106]">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#283106] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C7C2AB] rounded text-sm text-[#283106] bg-white hover:border-[#777E5C] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="finished">Finalizado</option>
              <option value="ended">Culminado</option>
            </select>
          </div>

          {/* Bird Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#283106] mb-1">Tipo de Ave</label>
            <select
              value={birdTypeFilter}
              onChange={(e) => setBirdTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C7C2AB] rounded text-sm text-[#283106] bg-white hover:border-[#777E5C] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="layers">Postura</option>
              <option value="broilers">Corte</option>
              <option value="breeders">Reprodução</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#283106] mb-1">Data Início</label>
            <input
              type="date"
              value={dateStartFilter}
              onChange={(e) => setDateStartFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C7C2AB] rounded text-sm text-[#283106] bg-white"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#283106] mb-1">Data Fim</label>
            <input
              type="date"
              value={dateEndFilter}
              onChange={(e) => setDateEndFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C7C2AB] rounded text-sm text-[#283106] bg-white"
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              setStatusFilter('all')
              setBirdTypeFilter('all')
              setDateStartFilter('')
              setDateEndFilter('')
            }}
            className="text-xs text-[#777E5C] hover:text-[#283106] transition-colors underline"
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
      {hasMore && <div className="flex justify-center"><button onClick={() => void fetchBatches(batches.length, true)} disabled={loadingMore} className="rounded-lg border border-[#DDE1D2] bg-white px-5 py-2 text-sm font-semibold text-[#384126] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar mais lotes'}</button></div>}
      
      {filteredBatches.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-[#777E5C] text-sm">Nenhum lote encontrado com os filtros selecionados</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Deletar Lote"
        message="Tem certeza que deseja deletar este lote? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
