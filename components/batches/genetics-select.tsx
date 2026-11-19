'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FormField } from '@/components/crud/form-section'
import { getClientJson } from '@/lib/client-data'

export interface GeneticOption {
  id: string
  genetic_name: string
  bird_type: string | null
  category: string | null
}

interface GeneticsSelectProps {
  value: string
  birdType: string
  onChange: (value: string) => void
  label?: string
}

const OTHER = '__other__'

const fieldClass =
  'px-3 py-2 text-xs sm:text-sm border border-[#C9D4D1] rounded bg-white text-[#515062] placeholder-[#B0A89A] focus:outline-none focus:border-[#7D8B89]'

function appliesTo(option: GeneticOption, birdType: string) {
  return !birdType || birdType === 'breeders' || !option.bird_type || option.bird_type === birdType
}

export default function GeneticsSelect({ value, birdType, onChange, label = 'Genética / Linhagem' }: GeneticsSelectProps) {
  const [options, setOptions] = useState<GeneticOption[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [other, setOther] = useState(false)

  useEffect(() => {
    let active = true
    getClientJson<unknown>('/api/genetics')
      .then((data) => {
        if (!active) return
        setOptions(Array.isArray(data) ? (data as GeneticOption[]) : [])
      })
      .catch((error) => {
        if (!active) return
        console.error('[v0] Error loading genetics:', error)
        setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar as genéticas.')
      })
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [])

  const visible = useMemo(() => options.filter((option) => appliesTo(option, birdType)), [options, birdType])
  const inAll = options.some((option) => option.genetic_name === value)
  const inVisible = visible.some((option) => option.genetic_name === value)

  // Valor que não está no catálogo (lote antigo, escrito à mão): mantém-se como «Outra».
  useEffect(() => {
    if (loaded && value && !inAll) setOther(true)
  }, [loaded, value, inAll])

  // Ao mudar o tipo de ave, limpa uma genética do catálogo que já não se aplica.
  useEffect(() => {
    if (loaded && value && inAll && !inVisible) onChange('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birdType, loaded])

  const isOther = other || (loaded && !!value && !inAll)

  const groups = useMemo(() => {
    const map = new Map<string, GeneticOption[]>()
    for (const option of visible) {
      const key = option.category || 'Outras'
      map.set(key, [...(map.get(key) || []), option])
    }
    return Array.from(map.entries())
  }, [visible])

  function handleSelect(next: string) {
    if (next === OTHER) {
      setOther(true)
      if (inAll) onChange('')
      return
    }
    setOther(false)
    onChange(next)
  }

  return (
    <FormField label={label}>
      <select
        value={isOther ? OTHER : value}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={!loaded}
        className={fieldClass}
      >
        <option value="">{loaded ? 'Selecione uma genética' : 'A carregar…'}</option>
        {groups.map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map((item) => <option key={item.id} value={item.genetic_name}>{item.genetic_name}</option>)}
          </optgroup>
        ))}
        <option value={OTHER}>Outra (escrever)</option>
      </select>
      {isOther && (
        <input
          type="text"
          autoFocus={!value}
          placeholder="Escreva o nome da genética"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} mt-2`}
        />
      )}
      {loadError && <p className="mt-1 text-xs text-red-600">{loadError}</p>}
      {loaded && !loadError && options.length === 0 && (
        <p className="mt-1 text-xs text-[#7D8B89]">
          Ainda não há genéticas registadas. <Link href="/modules/configuration/genetics" className="font-semibold underline">Registar genéticas</Link>
        </p>
      )}
    </FormField>
  )
}