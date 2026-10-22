'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

interface Purchase {
  id: string
  purchase_date: string
  supplier_name?: string
  product_type: string
  quantity: number
  unit: string
  unit_cost: number
  total_cost: number
  status: string
  notes?: string
}

export default function SuppliesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateStartFilter, setDateStartFilter] = useState<string>('')
  const [dateEndFilter, setDateEndFilter] = useState<string>('')
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = purchases

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((purchase) => purchase.status === statusFilter)
    }

    // Bird type filter
    if (productTypeFilter !== 'all') {
      filtered = filtered.filter((purchase) => purchase.product_type === productTypeFilter)
    }

    // Date range filter
    if (dateStartFilter) {
      filtered = filtered.filter((purchase) => new Date(purchase.purchase_date) >= new Date(dateStartFilter))
    }

    if (dateEndFilter) {
      filtered = filtered.filter((purchase) => new Date(purchase.purchase_date) <= new Date(dateEndFilter))
    }

    setFilteredPurchases(filtered)
  }, [purchases, statusFilter, dateStartFilter, dateEndFilter, productTypeFilter])

  async function fetchBatches(offset = 0, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data: unknown = await getClientJson(pagedEndpoint('/api/purchases', offset))
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setPurchases((current) => append ? [...current, ...data] : data)
        setHasMore(data.length === CLIENT_PAGE_SIZE)
      } else {
        console.error('[v0] API response is not an array:', data)
        setPurchases([])
      }
    } catch (error) {
      console.error('[v0] Error fetching purchases:', error)
      setPurchases([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/purchases/${deleteId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      invalidateClientData('/api/purchases')
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
    window.location.href = `/modules/purchases/management?purchase=${encodeURIComponent(id)}`
  }

  const columns = [
    { key: 'purchase_date', label: 'Data', render: (v: string) => v ? new Date(v).toLocaleDateString('pt-MZ') : '—' },
    { key: 'product_type', label: 'Produto' },
    { key: 'supplier_name', label: 'Fornecedor' },
    { key: 'quantity', label: 'Quantidade', render: (v: number, row: Purchase) => `${v || 0} ${row.unit || ''}` },
    { key: 'total_cost', label: 'Valor total', render: (v: number) => `MZN ${Number(v || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}` },
    { key: 'status', label: 'Estado' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <PageHeader 
          title="Suprimentos"
          description="Controle de estoque e suprimentos"
        />
        <Link
          href="/modules/supplies"
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Novo Suprimento
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
              <option value="pending">Pendente</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Bird Type Filter */}
          <div>
              <label className="block text-xs font-semibold text-[#283106] mb-1">Tipo de produto</label>
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#C7C2AB] rounded text-sm text-[#283106] bg-white hover:border-[#777E5C] transition-colors"
            >
              <option value="all">Todos</option>
              <option value="feed">Ração</option>
              <option value="medication">Medicamentos</option>
              <option value="supplies">Abastecimentos</option>
              <option value="equipment">Equipamentos</option>
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
              setProductTypeFilter('all')
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
        data={filteredPurchases}
        onEdit={handleEdit}
        onDelete={(id) => setDeleteId(id)}
        loading={loading}
      />
      {hasMore && <div className="flex justify-center"><button onClick={() => void fetchBatches(purchases.length, true)} disabled={loadingMore} className="rounded-lg border border-[#DDE1D2] bg-white px-5 py-2 text-sm font-semibold text-[#384126] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar mais registos'}</button></div>}
      
      {filteredPurchases.length === 0 && !loading && (
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
