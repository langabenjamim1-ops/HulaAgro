'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'

interface Employee {
  id: string
  employee_name: string
  employee_role?: string
  hire_date?: string
  salary?: number
  status: string
  contact_number?: string
}

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      setLoading(true)
      const response = await fetch('/api/employees')
      const data = await response.json()
      if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        setEmployees([])
      }
    } catch (error) {
      console.error('[v0] Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/employees/${deleteId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      await fetchEmployees()
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error deleting employee:', error)
      alert('Erro ao deletar funcionário')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'employee_name', label: 'Nome' },
    { key: 'employee_role', label: 'Função' },
    { key: 'hire_date', label: 'Data Contratação', render: (v: string) => v ? new Date(v).toLocaleDateString('pt-MZ') : '-' },
    { key: 'salary', label: 'Salário', render: (v: number) => v ? `MZN ${v.toLocaleString('pt-MZ')}` : '-' },
    { key: 'status', label: 'Status', render: (v: string) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        v === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {v === 'active' ? 'Ativo' : 'Inativo'}
      </span>
    ) },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <PageHeader title="Funcionários" description="Gerenciar funcionários do galpão" />
        <Link
          href="/modules/hr/employees/create"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </Link>
      </div>

      <CRUDTable
        columns={columns}
        data={employees}
        onEdit={(id) => window.location.href = `/modules/hr/employees/${id}/edit`}
        onDelete={(id) => setDeleteId(id)}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Deletar Funcionário"
        message="Tem certeza que deseja deletar este funcionário?"
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
