'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FormField } from '@/components/crud/form-section'

type Option = { id: string; name: string; capacity: number | null; status: string | null; occupied?: number }

type Value = { facility_id: string; facility_location: string }

const fieldClass = 'px-3 py-2 text-xs sm:text-sm border border-[#C9D4D1] rounded bg-white text-[#515062] placeholder-[#B0A89A] focus:outline-none focus:border-[#7D8B89]'

// Escolha do galpão do lote. Sem galpão escolhido, continua a ser possível escrever o local à mão.
export default function FacilitySelect({ facilityId, location, onChange }: { facilityId: string; location: string; onChange: (value: Value) => void }) {
  const [options, setOptions] = useState<Option[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/facilities', { cache: 'no-store' })
      .then(async (response) => {
        const data: unknown = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(String((data as { error?: string }).error || 'Não foi possível carregar os galpões.'))
        if (active) setOptions(Array.isArray(data) ? (data as Option[]) : [])
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os galpões.') })
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [])

  function pick(id: string) {
    const chosen = options.find((option) => option.id === id)
    onChange({ facility_id: id, facility_location: chosen ? chosen.name : '' })
  }

  return (
    <FormField label="Galpão / Local da Instalação">
      <select value={facilityId} onChange={(event) => pick(event.target.value)} disabled={!loaded} className={fieldClass}>
        <option value="">{loaded ? 'Sem galpão (escrever o local)' : 'A carregar…'}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} disabled={option.status === 'inactive' && option.id !== facilityId}>
            {option.name}{option.capacity ? ` · ${option.occupied ?? 0}/${option.capacity} aves` : ''}{option.status === 'inactive' ? ' (inativo)' : ''}
          </option>
        ))}
      </select>
      {!facilityId && (
        <input type="text" placeholder="Ex: Galpão 1" value={location} onChange={(event) => onChange({ facility_id: '', facility_location: event.target.value })} className={`${fieldClass} mt-2`} />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {loaded && !error && options.length === 0 && (
        <p className="mt-1 text-xs text-[#7D8B89]">Ainda não há galpões. <Link href="/modules/batches/facilities" className="font-semibold underline">Criar galpão</Link></p>
      )}
    </FormField>
  )
}