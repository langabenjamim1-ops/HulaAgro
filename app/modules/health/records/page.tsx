'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'
import { CLIENT_PAGE_SIZE, getClientJson, invalidateClientData, pagedEndpoint } from '@/lib/client-data'

interface HealthRecord {
  id: string
  record_date: string
  health_status: string
  medication_name?: string
  disease_detected?: string
  birds_affected?: number
}

export default function HealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords(offset = 0, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data: unknown = await getClientJson(pagedEndpoint('/api/health', offset))
      if (Array.isArray(data)) {
        setRecords((current) => append ? [...current, ...data] : data)
        setHasMore(data.length === CLIENT_PAGE_SIZE)
      } else {
        setRecords([])
      }
    } catch (error) {
      console.error('[v0] Error fetching health records:', error)
      setRecords([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/health/${deleteId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      invalidateClientData('/api/health')
      await fetchRecords()
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error deleting record:', error)
      alert('Erro ao deletar registro')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'record_date', label: 'Data', render: (v: string) => new Date(v).toLocaleDateString('pt-MZ') },
    { key: 'health_status', label: 'Status de Saúde' },
    { key: 'medication_name', label: 'Medicamento' },
    { key: 'disease_detected', label: 'Doença Detectada' },
    { key: 'birds_affected', label: 'Aves Afetadas' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <PageHeader title="Registros de Saúde" description="Gerenciar registros de saúde do galpão" />
        <Link
          href="/modules/health/records/create"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </Link>
      </div>

      <CRUDTable
        columns={columns}
        data={records}
        onEdit={(id) => window.location.href = `/modules/health/records/${id}/edit`}
        onDelete={(id) => setDeleteId(id)}
        loading={loading}
      />
      {hasMore && <div className="flex justify-center"><button onClick={() => void fetchRecords(records.length, true)} disabled={loadingMore} className="rounded-lg border border-[#DDE1D2] bg-white px-5 py-2 text-sm font-semibold text-[#384126] disabled:opacity-60">{loadingMore ? 'A carregar…' : 'Carregar registos anteriores'}</button></div>}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Deletar Registro"
        message="Tem certeza que deseja deletar este registro de saúde?"
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
