'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormSection, { FormInput, FormSelect, FormTextarea } from '@/components/crud/form-section'
import PageHeader from '@/components/common/page-header'
import GeneticsSelect from '@/components/batches/genetics-select'
import FacilitySelect from '@/components/batches/facility-select'
import { invalidateClientData } from '@/lib/client-data'
import { formatMZN, formatNumber } from '@/lib/batches/labels'

export default function CreateBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    batch_code: '',
    bird_type: '',
    birds_count: '',
    genetics: '',
    facility_location: '',
    facility_id: '',
    start_date: new Date().toISOString().split('T')[0],
    origin_supplier: '',
    hatch_date: '',
    document_number: '',
    ordered_count: '',
    unit_cost: '',
    notes: ''
  })

  const received = parseInt(formData.birds_count) || 0
  const ordered = parseInt(formData.ordered_count) || 0
  const unitCost = parseFloat(formData.unit_cost) || 0
  const difference = ordered && received ? received - ordered : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.batch_code.trim() || !formData.bird_type || !formData.birds_count || !formData.start_date) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    if (received <= 0) {
      setError('A quantidade de aves tem de ser maior que 0')
      return
    }
    if (formData.hatch_date && formData.hatch_date > formData.start_date) {
      setError('A data de nascimento não pode ser depois da data de entrada')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birds_count: received,
          ordered_count: formData.ordered_count ? ordered : null,
          unit_cost: formData.unit_cost ? unitCost : null,
        })
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to create batch')

      invalidateClientData('/api/batches')
      router.push(data.id ? `/modules/batches/${data.id}` : '/modules/batches/list')
    } catch (err) {
      console.error('[v0] Error creating batch:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar lote. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex items-center gap-2">
        <Link href="/modules/batches/list">
          <ArrowLeft className="w-5 h-5 text-[#515062] cursor-pointer hover:text-[#7D8B89]" />
        </Link>
        <PageHeader
          title="Criar Novo Lote"
          description="Registe um novo lote de aves no seu galpão"
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
            placeholder="5000"
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
        </FormSection>

        <FormSection title="Origem e Compra" columns={2}>
          <FormInput
            label="Fornecedor / Incubadora"
            placeholder="Ex: Incubadora Central"
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
            placeholder="Ex: FT 2026/0123"
            value={formData.document_number}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
          />

          <FormInput
            label="Quantidade Encomendada"
            type="number"
            min={1}
            placeholder="5000"
            value={formData.ordered_count}
            onChange={(e) => setFormData({ ...formData, ordered_count: e.target.value })}
          />

          <FormInput
            label="Custo por Ave (MZN)"
            type="number"
            min={0}
            step="0.01"
            placeholder="45.00"
            value={formData.unit_cost}
            onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
          />

          <div className="flex flex-col justify-end gap-1 text-xs sm:text-sm text-[#515062]">
            {unitCost > 0 && received > 0 && (
              <p>Custo total das aves: <strong>{formatMZN(unitCost * received)}</strong></p>
            )}
            {difference !== null && difference !== 0 && (
              <p className={difference < 0 ? 'text-red-700' : 'text-[#2FB394]'}>
                {difference < 0
                  ? `Faltam ${formatNumber(Math.abs(difference))} aves em relação ao encomendado`
                  : `Recebidas ${formatNumber(difference)} aves a mais do que o encomendado`}
              </p>
            )}
          </div>
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
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#515062] text-white rounded hover:bg-[#3F3E4D] transition-colors disabled:opacity-50 font-semibold text-sm"
          >
            {loading ? 'Criando...' : 'Criar Lote'}
          </button>
          <Link
            href="/modules/batches/list"
            className="flex-1 px-4 py-2 border border-[#C9D4D1] text-[#515062] rounded hover:bg-[#F9F9F9] transition-colors font-semibold text-sm text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}