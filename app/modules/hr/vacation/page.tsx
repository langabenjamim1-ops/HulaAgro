'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import CRUDTable from '@/components/crud/crud-table'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import PageHeader from '@/components/common/page-header'

interface Vacation {
  id: string
  employee_id: string
  farm_id: string
  start_date: string
  end_date: string
  days_taken: number | null
  notes?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
}
interface Employee { id: string; farm_id: string; employee_name: string }

const emptyForm = { employee_id: '', start_date: '', end_date: '', days_taken: '', notes: '' }

export default function VacationPage() {
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [vacationResponse, employeeResponse] = await Promise.all([fetch('/api/vacation'), fetch('/api/employees')])
      if (!vacationResponse.ok || !employeeResponse.ok) throw new Error('Não foi possível carregar os pedidos de férias.')
      const [vacationData, employeeData] = await Promise.all([vacationResponse.json(), employeeResponse.json()])
      setVacations(Array.isArray(vacationData) ? vacationData : [])
      setEmployees(Array.isArray(employeeData) ? employeeData : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dados.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  function startCreate() { setEditing(null); setForm(emptyForm); setError(''); setIsOpen(true) }
  function startEdit(id: string) {
    const item = vacations.find((vacation) => vacation.id === id)
    if (!item) return
    setEditing(id)
    setForm({ employee_id: item.employee_id, start_date: item.start_date, end_date: item.end_date, days_taken: String(item.days_taken ?? ''), notes: item.notes || '' })
    setError(''); setIsOpen(true)
  }

  async function saveVacation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const employee = employees.find((item) => item.id === form.employee_id)
    if (!employee?.farm_id) { setError('O funcionário selecionado não tem uma exploração associada.'); return }
    if (form.end_date < form.start_date) { setError('A data final deve ser igual ou posterior à data inicial.'); return }
    const elapsedDays = Math.floor((new Date(`${form.end_date}T00:00:00`).getTime() - new Date(`${form.start_date}T00:00:00`).getTime()) / 86400000) + 1
    const body = { employee_id: employee.id, farm_id: employee.farm_id, start_date: form.start_date, end_date: form.end_date, days_taken: Number(form.days_taken) || elapsedDays, notes: form.notes }
    setSaving(true); setError('')
    try {
      const response = await fetch(editing ? `/api/vacation/${editing}` : '/api/vacation', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Não foi possível guardar o pedido.')
      setIsOpen(false); await loadData()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Erro ao guardar o pedido.') }
    finally { setSaving(false) }
  }

  async function removeVacation() {
    if (!deleteId) return
    const response = await fetch(`/api/vacation/${deleteId}`, { method: 'DELETE' })
    if (!response.ok) { setError('Não foi possível remover o pedido.'); return }
    setDeleteId(null); await loadData()
  }

  const columns = [
    { key: 'employee_id', label: 'Funcionário', render: (id: string) => employees.find((employee) => employee.id === id)?.employee_name || id },
    { key: 'start_date', label: 'Início', render: (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('pt-MZ') },
    { key: 'end_date', label: 'Fim', render: (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString('pt-MZ') },
    { key: 'days_taken', label: 'Dias' },
    { key: 'notes', label: 'Notas' },
    { key: 'status', label: 'Estado', render: (value: string) => value === 'approved' ? 'Aprovado' : value === 'rejected' ? 'Rejeitado' : value === 'cancelled' ? 'Cancelado' : 'Pendente' },
  ]

  return <div className="space-y-5 font-montserrat">
    <div className="flex flex-wrap items-center justify-between gap-3"><PageHeader title="Férias e ausências" description="Registar e acompanhar pedidos de férias dos funcionários." /><button onClick={startCreate} className="flex items-center gap-2 rounded bg-[#283106] px-4 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Novo pedido</button></div>
    {error && !isOpen && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <CRUDTable columns={columns} data={vacations} onEdit={startEdit} onDelete={setDeleteId} loading={loading} />
    {isOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"><form onSubmit={saveVacation} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-xl"><h2 className="text-lg font-bold text-[#283106]">{editing ? 'Editar pedido de férias' : 'Novo pedido de férias'}</h2>
      <label className="block text-sm">Funcionário<select required value={form.employee_id} onChange={(event) => setForm({ ...form, employee_id: event.target.value })} className="mt-1 w-full rounded border p-2"><option value="">Selecionar funcionário</option>{employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.employee_name}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-3"><label className="text-sm">Data inicial<input required type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="mt-1 w-full rounded border p-2" /></label><label className="text-sm">Data final<input required type="date" min={form.start_date} value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="mt-1 w-full rounded border p-2" /></label></div>
      <label className="block text-sm">Dias (calculado automaticamente se vazio)<input type="number" min="1" value={form.days_taken} onChange={(event) => setForm({ ...form, days_taken: event.target.value })} className="mt-1 w-full rounded border p-2" /></label>
      <label className="block text-sm">Notas<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 w-full rounded border p-2" rows={3} /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setIsOpen(false)} className="rounded border px-4 py-2 text-sm">Cancelar</button><button disabled={saving} className="rounded bg-[#283106] px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'A guardar…' : 'Guardar pedido'}</button></div>
    </form></div>}
    <ConfirmDialog isOpen={deleteId !== null} title="Remover pedido" message="Confirma a remoção deste pedido de férias?" confirmText="Remover" cancelText="Cancelar" isDangerous onConfirm={removeVacation} onCancel={() => setDeleteId(null)} />
  </div>
}
