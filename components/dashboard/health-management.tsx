'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getHealth, addHealth, getVaccinations, addVaccination, getHens } from '@/lib/actions'

interface HealthManagementProps {
  refreshTrigger: number
}

export default function HealthManagement({ refreshTrigger }: HealthManagementProps) {
  const [healthRecords, setHealthRecords] = useState<any[]>([])
  const [vaccinations, setVaccinations] = useState<any[]>([])
  const [hens, setHens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [healthOpen, setHealthOpen] = useState(false)
  const [vaccineOpen, setVaccineOpen] = useState(false)
  const [healthForm, setHealthForm] = useState({
    hen_id: '',
    issue: '',
    status: 'alert',
    treatment: '',
  })
  const [vaccineForm, setVaccineForm] = useState({
    hen_id: '',
    vaccine_name: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [refreshTrigger])

  async function loadData() {
    setLoading(true)
    try {
      const [healthData, vaccineData, hensData] = await Promise.all([
        getHealth(),
        getVaccinations(),
        getHens(),
      ])
      setHealthRecords(healthData || [])
      setVaccinations(vaccineData || [])
      setHens(hensData || [])
    } catch (error) {
      console.log('[v0] Error loading health data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddHealth(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addHealth({
        hen_id: healthForm.hen_id,
        issue: healthForm.issue,
        status: healthForm.status,
        treatment: healthForm.treatment || undefined,
      })
      setHealthForm({ hen_id: '', issue: '', status: 'alert', treatment: '' })
      setHealthOpen(false)
      loadData()
    } catch (error) {
      console.log('[v0] Error adding health record:', error)
    }
  }

  async function handleAddVaccine(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addVaccination({
        hen_id: vaccineForm.hen_id,
        vaccine_name: vaccineForm.vaccine_name,
        date: vaccineForm.date,
        notes: vaccineForm.notes || undefined,
      })
      setVaccineForm({ hen_id: '', vaccine_name: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setVaccineOpen(false)
      loadData()
    } catch (error) {
      console.log('[v0] Error adding vaccination:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert':
        return 'bg-red-100 text-red-800'
      case 'in_treatment':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="vaccines">Vacinação</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gestão de Saúde</h2>
              <p className="text-gray-600 mt-1">Total: {healthRecords.length} registros</p>
            </div>
            <Dialog open={healthOpen} onOpenChange={setHealthOpen}>
              <DialogTrigger asChild>
                <Button>+ Registrar Problema</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Problema de Saúde</DialogTitle>
                  <DialogDescription>Adicione um novo problema de saúde</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddHealth} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Poedeira</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={healthForm.hen_id}
                      onChange={(e) => setHealthForm({ ...healthForm, hen_id: e.target.value })}
                      required
                    >
                      <option value="">Selecionar poedeira</option>
                      {hens.map((hen) => (
                        <option key={hen.id} value={hen.id}>
                          {hen.tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Problema</label>
                    <Input
                      placeholder="Ex: Ferimento na asa"
                      value={healthForm.issue}
                      onChange={(e) => setHealthForm({ ...healthForm, issue: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={healthForm.status} onValueChange={(value) => setHealthForm({ ...healthForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alerta</SelectItem>
                        <SelectItem value="in_treatment">Em Tratamento</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tratamento</label>
                    <Textarea
                      placeholder="Descrição do tratamento"
                      value={healthForm.treatment}
                      onChange={(e) => setHealthForm({ ...healthForm, treatment: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <Card><CardContent className="pt-6">Carregando...</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {healthRecords.length > 0 ? (
                    healthRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{record.issue}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(record.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status === 'alert' && 'Alerta'}
                            {record.status === 'in_treatment' && 'Em Tratamento'}
                            {record.status === 'resolved' && 'Resolvido'}
                          </Badge>
                        </div>
                        {record.treatment && (
                          <p className="text-sm text-gray-700 mt-2">{record.treatment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum registro de saúde</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vaccines" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Vacinação</h2>
              <p className="text-gray-600 mt-1">Total: {vaccinations.length} registros</p>
            </div>
            <Dialog open={vaccineOpen} onOpenChange={setVaccineOpen}>
              <DialogTrigger asChild>
                <Button>+ Registrar Vacinação</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Vacinação</DialogTitle>
                  <DialogDescription>Adicione um novo registro de vacinação</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddVaccine} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Poedeira</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={vaccineForm.hen_id}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, hen_id: e.target.value })}
                      required
                    >
                      <option value="">Selecionar poedeira</option>
                      {hens.map((hen) => (
                        <option key={hen.id} value={hen.id}>
                          {hen.tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Vacina</label>
                    <Input
                      placeholder="Ex: Newcastle"
                      value={vaccineForm.vaccine_name}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data da Vacinação</label>
                    <Input
                      type="date"
                      value={vaccineForm.date}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notas</label>
                    <Textarea
                      placeholder="Observações opcionais"
                      value={vaccineForm.notes}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Registrar Vacinação
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <Card><CardContent className="pt-6">Carregando...</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {vaccinations.length > 0 ? (
                    vaccinations.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{record.vaccine_name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(record.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-700 mt-2">{record.notes}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum registro de vacinação</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
