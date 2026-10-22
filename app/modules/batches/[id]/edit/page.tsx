'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormSection, { FormInput, FormSelect, FormTextarea } from '@/components/crud/form-section'
import PageHeader from '@/components/common/page-header'

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
    start_date: '',
    status: 'active',
    notes: '',
    farm_id: ''
  })

  useEffect(() => {
    fetchBatch()
  }, [batchId])

  async function fetchBatch() {
    try {
      const response = await fetch(`/api/batches/${batchId}`)
      if (!response.ok) throw new Error('Failed to fetch batch')
      const data = await response.json()
      setFormData(data)
    } catch (err) {
      console.error('[v0] Error fetching batch:', err)
      setError('Erro ao carregar lote')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.batch_code || !formData.bird_type || !formData.birds_count || !formData.start_date) {
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
          birds_count: parseInt(formData.birds_count)
        })
      })

      if (!response.ok) throw new Error('Failed to update batch')
      
      router.push('/modules/batches/list')
    } catch (err) {
      console.error('[v0] Error updating batch:', err)
      setError('Erro ao atualizar lote. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[#777E5C]">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex items-center gap-2">
        <Link href="/modules/batches/list">
          <ArrowLeft className="w-5 h-5 text-[#283106] cursor-pointer hover:text-[#777E5C]" />
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
              { value: 'layers', label: 'Postura' },
              { value: 'broilers', label: 'Corte' },
              { value: 'breeders', label: 'Reprodução' }
            ]}
          />
          
          <FormInput
            label="Quantidade de Aves"
            required
            type="number"
            placeholder="5000"
            value={formData.birds_count}
            onChange={(e) => setFormData({ ...formData, birds_count: e.target.value })}
          />
          
          <FormInput
            label="Genética"
            placeholder="Ex: Lohmann Brown"
            value={formData.genetics}
            onChange={(e) => setFormData({ ...formData, genetics: e.target.value })}
          />
          
          <FormInput
            label="Local da Instalação"
            placeholder="Ex: Galpão 1"
            value={formData.facility_location}
            onChange={(e) => setFormData({ ...formData, facility_location: e.target.value })}
          />
          
          <FormInput
            label="Data de Início"
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
              { value: 'culled', label: 'Culminado' }
            ]}
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
            className="flex-1 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors disabled:opacity-50 font-semibold text-sm"
          >
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <Link
            href="/modules/batches/list"
            className="flex-1 px-4 py-2 border border-[#C7C2AB] text-[#283106] rounded hover:bg-[#F5F4F1] transition-colors font-semibold text-sm text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
