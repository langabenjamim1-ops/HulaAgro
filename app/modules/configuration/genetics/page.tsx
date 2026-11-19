'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '@/components/common/page-header'
import ConfirmDialog from '@/components/crud/confirm-dialog'
import FormSection, { FormInput, FormSelect, FormTextarea } from '@/components/crud/form-section'
import { invalidateClientData } from '@/lib/client-data'
import { birdTypeLabel } from '@/lib/batches/labels'

interface Genetic {
  id: string
  genetic_code: string
  genetic_name: string
  bird_type: string | null
  category: string | null
  origin: string | null
  characteristics: string | null
  is_active: boolean
  batches_count: number
}

const emptyForm = { genetic_name: '', bird_type: '', category: '', origin: '', characteristics: '' }

export default function GeneticsConfigPage() {
  const [items, setItems] = useState<Genetic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Genetic | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/genetics?all=1', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as genéticas.')
      setItems(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      console.error('[v0] Error loading genetics:', err)
      setError(err instanceof Error ? err.message : 'Não foi possível carregar as genéticas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))) as string[]

  function startEdit(item: Genetic) {
    setEditingId(item.id)
    setForm({
      genetic_name: item.genetic_name,
      bird_type: item.bird_type || '',
      category: item.category || '',
      origin: item.origin || '',
      characteristics: item.characteristics || '',
    })
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.genetic_name.trim()) {
      setError('Indique o nome da genética')
      return
    }
    try {
      setSaving(true)
      setError('')
      const response = await fetch(editingId ? `/api/genetics/${editingId}` : '/api/genetics', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível guardar a genética.')
      setNotice(editingId
        ? `Genética atualizada.${data.renamed_batches ? ` ${data.renamed_batches} lote(s) passaram a usar o novo nome.` : ''}`
        : 'Genética registada.')
      invalidateClientData('/api/genetics')
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar a genética.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: Genetic) {
    try {
      const response = await fetch(`/api/genetics/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível alterar o estado.')
      invalidateClientData('/api/genetics')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o estado.')
    }
  }

  async function importCatalog() {
    try {
      setImporting(true)
      setError('')
      const response = await fetch('/api/genetics/seed', { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível importar o catálogo.')
      setNotice(data.inserted
        ? `${data.inserted} genéticas importadas.${data.skipped ? ` ${data.skipped} já existiam.` : ''}`
        : 'O catálogo padrão já estava todo importado.')
      invalidateClientData('/api/genetics')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível importar o catálogo.')
    } finally {
      setImporting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const response = await fetch(`/api/genetics/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Não foi possível apagar a genética.')
      invalidateClientData('/api/genetics')
      setNotice('Genética apagada.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível apagar a genética.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Genéticas e linhagens" description="Catálogo de linhagens disponíveis ao registar lotes." />
        <button
          type="button"
          onClick={importCatalog}
          disabled={importing}
          className="inline-flex items-center justify-center gap-2 rounded border border-[#C9D4D1] px-4 py-2 text-sm font-semibold text-[#515062] hover:bg-[#F9F9F9] disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {importing ? 'A importar…' : 'Importar catálogo padrão'}
        </button>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="font-semibold underline">Fechar</button>
        </div>
      )}
      {notice && (
        <div className="flex items-start justify-between gap-3 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-semibold underline">Fechar</button>
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <FormSection title={editingId ? 'Editar genética' : 'Registar genética'} columns={2}>
          <FormInput label="Nome da genética" required placeholder="Ex: Lohmann Brown" value={form.genetic_name} onChange={(e) => setForm({ ...form, genetic_name: e.target.value })} />
          <FormSelect
            label="Tipo de ave"
            value={form.bird_type}
            onChange={(e) => setForm({ ...form, bird_type: e.target.value })}
            options={[
              { value: 'layers', label: 'Postura (ovos)' },
              { value: 'broilers', label: 'Corte (carne)' },
              { value: 'breeders', label: 'Reprodução' },
            ]}
          />
          <div className="flex flex-col gap-1">
            <FormInput label="Categoria / grupo" list="genetic-categories" placeholder="Ex: Postura · ovos castanhos" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <datalist id="genetic-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
          </div>
          <FormInput label="Origem (empresa / país)" placeholder="Ex: Lohmann Tierzucht, Alemanha" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          <div className="sm:col-span-2">
            <FormTextarea label="Características" rows={2} placeholder="Ex: ovo castanho, pico de postura às 26 semanas" value={form.characteristics} onChange={(e) => setForm({ ...form, characteristics: e.target.value })} />
          </div>
        </FormSection>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded bg-[#515062] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3F3E4D] disabled:opacity-50">
            {saving ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Registar genética'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded border border-[#C9D4D1] px-4 py-2 text-sm font-semibold text-[#515062] hover:bg-[#F9F9F9]">Cancelar</button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded border border-[#C9D4D1] bg-white">
        <div className="border-b border-[#E2E8E6] px-4 py-3 sm:px-6"><h3 className="text-sm font-bold text-[#515062] sm:text-base">Genéticas registadas ({items.length})</h3></div>
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-[#7D8B89]">A carregar…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#7D8B89]">Ainda não há genéticas. Registe uma acima ou use «Importar catálogo padrão».</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#F9F9F9] text-left text-xs font-bold uppercase tracking-wide text-[#7D8B89]">
                <tr><th className="px-4 py-3">Genética</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Origem</th><th className="px-4 py-3">Lotes</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-center">Ações</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={`border-t border-[#EEF2F1] text-[#515062] ${item.is_active ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-3 font-semibold">{item.genetic_name}<span className="block text-xs font-normal text-[#7D8B89]">{item.genetic_code}</span></td>
                    <td className="px-4 py-3">{item.bird_type ? birdTypeLabel(item.bird_type) : '—'}</td>
                    <td className="px-4 py-3">{item.category || '—'}</td>
                    <td className="px-4 py-3">{item.origin || '—'}</td>
                    <td className="px-4 py-3">{item.batches_count}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleActive(item)} className={`rounded px-2 py-1 text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`} title="Clique para alterar">
                        {item.is_active ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => startEdit(item)} className="rounded-lg p-2 hover:bg-[#E3F5F0]" title="Editar" aria-label={`Editar ${item.genetic_name}`}><Pencil className="h-4 w-4 text-[#2FB394]" /></button>
                        <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg p-2 hover:bg-red-50" title="Apagar" aria-label={`Apagar ${item.genetic_name}`}><Trash2 className="h-4 w-4 text-red-600" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Apagar genética"
        message={deleteTarget ? `Apagar «${deleteTarget.genetic_name}»? Só é possível se nenhum lote a usar; caso contrário, desative-a.` : ''}
        confirmText="Apagar"
        cancelText="Cancelar"
        isDangerous
        isLoading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}