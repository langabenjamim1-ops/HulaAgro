'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Loader } from 'lucide-react'
import Link from 'next/link'
import { CLIENT_PAGE_SIZE, getClientJson, pagedEndpoint } from '@/lib/client-data'

interface VaccinationRecord {
  id: string
  vaccine_name: string
  vaccine_type: string
  application_date: string
  application_method: string
  birds_vaccinated: number
  dosage_volume_ml: number
  reaction_observed?: string
  notes?: string
}

export default function VaccinationPage() {
  const [records, setRecords] = useState<VaccinationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords(offset = 0, append = false) {
    try {
      if (append) setLoadingMore(true); else setLoading(true)
      const data: unknown = await getClientJson(pagedEndpoint('/api/vaccination', offset))
      if (!Array.isArray(data)) throw new Error('Resposta inválida da API.')
      setRecords((current) => append ? [...current, ...data] : data)
      setHasMore(data.length === CLIENT_PAGE_SIZE)
    } catch (error) {
      console.error('[v0] Fetch error:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/modules/health" className="text-green-600 hover:text-green-700 flex items-center gap-2 mb-4">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Calendário de Vacinação</h1>
          <p className="text-gray-600 mt-2">Gerencie calendários por tipo e genética</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">+ Novo Calendário</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">Nenhum registo de vacinação</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((record) => (
            <Card key={record.id} className="bg-white border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.vaccine_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tipo: {record.vaccine_type} • Aves: {record.birds_vaccinated} • Dose: {record.dosage_volume_ml}ml
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.application_date).toLocaleDateString('pt-BR')} • {record.application_method}
                    </p>
                    {record.reaction_observed && (
                      <p className="text-xs text-orange-600 mt-1">Reação: {record.reaction_observed}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Editar</Button>
                    <Button variant="outline" size="sm" className="text-red-600 bg-transparent">Deletar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {hasMore && <div className="flex justify-center"><Button variant="outline" onClick={() => void fetchRecords(records.length, true)} disabled={loadingMore}>{loadingMore ? 'A carregar…' : 'Carregar vacinações anteriores'}</Button></div>}
    </div>
  )
}
