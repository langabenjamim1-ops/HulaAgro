'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormSection, { FormInput, FormSelect, FormTextarea } from '@/components/crud/form-section'
import PageHeader from '@/components/common/page-header'
import GeneticsSelect from '@/components/batches/genetics-select'
import FacilitySelect from '@/components/batches/facility-select'
import { invalidateClientData } from '@/lib/client-data'

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value))
const day = (value: unknown) => (typeof value === 'string' ? value.slice(0, 10) : '')

export default function EditBatchPage() {
  const router = useRouter()
  const params = useParams()
  const batchId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    batch_code: '',
    bird_type: '',
    birds_count: '',
    genetics: '',
    facility_location: '',
    facility_id: '',
    start_date: '',
    end_date: '',
    status: 'active',
    origin_supplier: '',
    hatch_date: '',
    document_number: '',
    ordered_count: '',
    unit_cost: '',
    notes: '',
  })

  useEffect(() => {
    fetchBatch()
  }, [batchId])

  async function fetchBatch() {
    try {
      const response = await fetch(`/api/batches/${batchId}`, { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to fetch batch')
      setFormData({
        batch_code: text(data.batch_code),
        bird_type: text(data.bird_type),
        birds_count: text(data.birds_count),
        genetics: text(data.genetics),
        facility_location: text(data.facility_location),
        facility_id: text(data.facility_id),
        start_date: day(data.start_date),
        end_date: day(data.end_date),
        status: text(data.status) || 'active',
        origin_supplier: text(data.origin_supplier),
        hatch_date: day(data.hatch_date),
        document_number: text(data.document_number),
        ordered_count: text(data.ordered_count),
        unit_cost: text(data.unit_cost),
        notes: text(data.notes),
      })
    } catch (err) {
      console.error('[v0] Error fetching batch:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar lote')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.batch_code.trim() || !formData.bird_type || !formData.birds_count || !formData.start_date) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch(`/api/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birds_count: parseInt(formData.birds_count),
          ordered_count: formData.ordered_count ? parseInt(formData.ordered_count) : null,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          end_date: formData.status === 'active' ? null : formData.end_date || null,
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to update batch')

      invalidateClientData('/api/batches')
      router.push(`/modules/batches/${batchId}`)
    } catch (err) {
      console.error('[v0] Error updating batch:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar lote. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#7D8B89]">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex items-center gap-2">
        <Link href={`/modules/batches/${batchId}`}>
          <ArrowLeft className="w-5 h-5 text-[#515062] cursor-pointer hover:text-[#7D8B89]" />
        </Link>
        <PageHeader
          title="Editar Lote"
          description="Atualizar informações do lote"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Informações do Lote" columns={2}>
          <FormInput
            label="Código do Lote"
            required
            placeholder="Ex: LOTE-001"
            value={formData.batch_code}
            onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
          />

          <FormSelect
            label="Tipo de Ave"
            required
            value={formData.bird_type}
            onChange={(e) => setFormData({ ...formData, bird_type: e.target.value })}
            options={[
              { value: 'layers', label: 'Postura (ovos)' },
              { value: 'broilers', label: 'Corte (carne)' },
              { value: 'breeders', label: 'Reprodução' }
            ]}
          />

          <FormInput
            label="Quantidade de Aves Recebidas"
            required
            type="number"
            min={1}
            value={formData.birds_count}
            onChange={(e) => setFormData({ ...formData, birds_count: e.target.value })}
          />

          <GeneticsSelect
            birdType={formData.bird_type}
            value={formData.genetics}
            onChange={(genetics) => setFormData((current) => ({ ...current, genetics }))}
          />

          <FacilitySelect
            facilityId={formData.facility_id}
            location={formData.facility_location}
            onChange={(value) => setFormData((current) => ({ ...current, ...value }))}
          />

          <FormInput
            label="Data de Entrada"
            required
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />

          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Ativo' },
              { value: 'finished', label: 'Finalizado' },
              { value: 'ended', label: 'Culminado' }
            ]}
          />

          {formData.status !== 'active' && (
            <FormInput
              label="Data de Término"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          )}
        </FormSection>

        <FormSection title="Origem e Compra" columns={2}>
          <FormInput
            label="Fornecedor / Incubadora"
            value={formData.origin_supplier}
            onChange={(e) => setFormData({ ...formData, origin_supplier: e.target.value })}
          />

          <FormInput
            label="Data de Nascimento das Aves"
            type="date"
            value={formData.hatch_date}
            onChange={(e) => setFormData({ ...formData, hatch_date: e.target.value })}
          />

          <FormInput
            label="Nº da Guia / Fatura"
            value={formData.document_number}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
          />

          <FormInput
            label="Quantidade Encomendada"
            type="number"
            min={1}
            value={formData.ordered_count}
            onChange={(e) => setFormData({ ...formData, ordered_count: e.target.value })}
          />

          <FormInput
            label="Custo por Ave (MZN)"
            type="number"
            min={0}
            step="0.01"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
          />
        </FormSection>

        <FormSection title="Observações">
          <FormTextarea
            label="Notas Adicionais"
            placeholder="Informações extras sobre o lote"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </FormSection>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-[#515062] text-white rounded hover:bg-[#3F3E4D] transition-colors disabled:opacity-50 font-semibold text-sm"
          >
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <Link
            href={`/modules/batches/${batchId}`}
            className="flex-1 px-4 py-2 border border-[#C9D4D1] text-[#515062] rounded hover:bg-[#F9F9F9] transition-colors font-semibold text-sm text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}