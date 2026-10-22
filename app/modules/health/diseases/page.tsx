'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'

interface Disease {
  id: string
  disease_name: string
  symptoms: string
  transmission_method: string
  incubation_days?: number
  treatment_description?: string
  mortality_rate?: number
  prevention_notes?: string
}

export default function DiseasesPage() {
  const [records, setRecords] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      setLoading(true)
      const response = await fetch('/api/diseases')
      const data = await response.json()
      if (Array.isArray(data)) {
        setRecords(data)
      } else {
        setRecords([])
      }
    } catch (error) {
      console.error('[v0] Error fetching health records:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/diseases/${deleteId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
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
    { key: 'disease_name', label: 'Doença' },
    { key: 'symptoms', label: 'Sintomas' },
    { key: 'transmission_method', label: 'Transmissão' },
    { key: 'incubation_days', label: 'Incubação (dias)', render: (v: number) => v ? `${v} dias` : '-' },
    { key: 'mortality_rate', label: 'Taxa Mortalidade', render: (v: number) => v ? `${v}%` : '-' },
    { key: 'treatment_description', label: 'Tratamento' },
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
