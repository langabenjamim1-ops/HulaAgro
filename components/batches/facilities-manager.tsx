'use client'

import { useCallback, useEffect, useState } from 'react'
import { Building2, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'

type Facility = {
  id: string; name: string; facility_type: string | null; capacity: number | null; status: string | null
  last_maintenance: string | null; notes: string | null; occupied: number; active_batches: number
}

const TYPES = ['Galpão de postura', 'Galpão de corte', 'Pinteiro', 'Armazém', 'Outro']
const STATUS_LABELS: Record<string, string> = { active: 'Ativo', maintenance: 'Em manutenção', inactive: 'Inativo' }
const empty = { name: '', facility_type: '', capacity: '', status: 'active', last_maintenance: '', notes: '' }
const input = 'w-full rounded-lg border border-[#E2E8E6] bg-white px-3 py-2.5 text-sm'
const label = 'space-y-1 text-sm font-medium text-[#5F5E73]'

async function readJson(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>
}

export function FacilitiesManager() {
  const [rows, setRows] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/facilities', { cache: 'no-store' })
      const data: unknown = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível carregar os galpões.'))
      setRows(Array.isArray(data) ? (data as Facility[]) : [])
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar os galpões.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function openNew() { setEditingId(null); setForm(empty); setError(''); setNotice(''); setOpen(true) }
  function openEdit(row: Facility) {
    setEditingId(row.id)
    setForm({ name: row.name, facility_type: row.facility_type ?? '', capacity: row.capacity ? String(row.capacity) : '', status: row.status ?? 'active', last_maintenance: row.last_maintenance ? row.last_maintenance.slice(0, 10) : '', notes: row.notes ?? '' })
    setError(''); setNotice(''); setOpen(true)
  }

  async function save() {
    setError(''); setNotice('')
    if (!form.name.trim()) { setError('Indique o nome do galpão.'); return }
    setSaving(true)
    try {
      const response = await fetch(editingId ? `/api/facilities/${editingId}` : '/api/facilities', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await readJson(response)
      if (!response.ok) throw new Error(String(data.error || 'Não foi possível guardar o galpão.'))
      setNotice(editingId ? 'Galpão atualizado.' : 'Galpão criado.')
      setOpen(false); setEditingId(null); setForm(empty)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao guardar o galpão.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(row: Facility) {
    if (!window.confirm(`Apagar o galpão «${row.name}»? Esta ação não pode ser desfeita.`)) return
    setError(''); setNotice('')
    try {
      const response = await fetch(`/api/facilities/${row.id}`, { method: 'DELETE' })
      const data = await readJson(response)
      if (!response.ok) throw new Error(String(data.error || 'Não foi possível apagar o galpão.'))
      setNotice('Galpão apagado.')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao apagar o galpão.')
    }
  }

  return <div className="space-y-6 pb-8">
    <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#515062] p-6 text-white sm:flex-row sm:items-center sm:p-8">
      <div><div className="flex items-center gap-2 text-[#D5DEDC]"><Building2 className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.16em]">Instalações</span></div><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Galpões e instalações</h1><p className="mt-2 text-sm leading-6 text-[#E2E8E6]">Registe os galpões da sua quinta, a capacidade e quantas aves cada um tem.</p></div>
      <button onClick={open ? () => setOpen(false) : openNew} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CDEFE7] px-4 py-2.5 text-sm font-bold text-[#515062] hover:bg-white">{open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{open ? 'Fechar' : 'Novo galpão'}</button>
    </section>

    {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

    {open && <section className="rounded-xl border border-[#E2E8E6] bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-bold text-[#515062]">{editingId ? 'Editar galpão' : 'Novo galpão'}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className={label}>Nome<input type="text" placeholder="Ex: Galpão 1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></label>
        <label className={label}>Tipo<select value={form.facility_type} onChange={(e) => setForm({ ...form, facility_type: e.target.value })} className={input}><option value="">Seleciona</option>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}{form.facility_type && !TYPES.includes(form.facility_type) && <option value={form.facility_type}>{form.facility_type}</option>}</select></label>
        <label className={label}>Capacidade (aves)<input type="number" min={1} step={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={input} /></label>
        <label className={label}>Estado<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>{Object.entries(STATUS_LABELS).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
        <label className={label}>Última manutenção<input type="date" value={form.last_maintenance} onChange={(e) => setForm({ ...form, last_maintenance: e.target.value })} className={input} /></label>
        <label className={label}>Observações<input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={input} /></label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-2 rounded-lg bg-[#2FB394] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5F5E73] disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}{editingId ? 'Guardar alterações' : 'Guardar galpão'}</button></div>
    </section>}

    <section className="overflow-hidden rounded-xl border border-[#E2E8E6] bg-white shadow-sm">
      <div className="border-b border-[#EEF2F1] px-5 py-4"><h2 className="font-bold text-[#515062]">Os meus galpões</h2></div>
      {loading ? <p className="p-6 text-sm text-[#7D8B89]">A carregar…</p> : rows.length === 0 ? <p className="p-8 text-center text-sm text-[#7D8B89]">Ainda não existem galpões. Carregue em «Novo galpão» para criar o primeiro.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#F9F9F9] text-left text-xs uppercase text-[#7D8B89]"><tr><th className="px-4 py-3">Galpão</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Ocupação</th><th className="px-4 py-3">Lotes ativos</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3" /></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-[#EEF2F1]"><td className="px-4 py-3 font-medium text-[#515062]">{row.name}</td><td className="px-4 py-3">{row.facility_type || '—'}</td><td className="px-4 py-3">{row.occupied.toLocaleString('pt-MZ')}{row.capacity ? ` / ${row.capacity.toLocaleString('pt-MZ')}` : ''} aves</td><td className="px-4 py-3">{row.active_batches}</td><td className="px-4 py-3">{STATUS_LABELS[row.status ?? ''] ?? row.status ?? '—'}</td><td className="whitespace-nowrap px-4 py-3 text-right"><button aria-label="Editar galpão" onClick={() => openEdit(row)} className="mr-3 text-[#98ABA9] hover:text-[#515062]"><Pencil className="h-4 w-4" /></button><button aria-label="Apagar galpão" onClick={() => void remove(row)} className="text-[#98ABA9] hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>}
    </section>
  </div>
}