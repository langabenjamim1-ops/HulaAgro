'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormSection, { FormInput, FormSelect, FormTextarea } from '@/components/crud/form-section'
import PageHeader from '@/components/common/page-header'

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
    start_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
    farm_id: '00000000-0000-0000-0000-000000000000' // Default farm ID
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.batch_code || !formData.bird_type || !formData.birds_count || !formData.start_date) {
      setError('Preencha todos os campos obrigatórios')
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
          birds_count: parseInt(formData.birds_count)
        })
      })

      if (!response.ok) throw new Error('Failed to create batch')
      
      router.push('/modules/batches/list')
    } catch (err) {
      console.error('[v0] Error creating batch:', err)
      setError('Erro ao criar lote. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-montserrat">
      <div className="flex items-center gap-2">
        <Link href="/modules/batches/list">
          <ArrowLeft className="w-5 h-5 text-[#283106] cursor-pointer hover:text-[#777E5C]" />
        </Link>
        <PageHeader 
          title="Criar Novo Lote"
          description="Registre um novo lote de aves no seu galpão"
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
            className="flex-1 px-4 py-2 bg-[#283106] text-white rounded hover:bg-[#1a1f04] transition-colors disabled:opacity-50 font-semibold text-sm"
          >
            {loading ? 'Criando...' : 'Criar Lote'}
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
