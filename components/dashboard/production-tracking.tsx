'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getProduction, addProduction, getHens } from '@/lib/actions'

interface ProductionTrackingProps {
  refreshTrigger: number
}

export default function ProductionTracking({ refreshTrigger }: ProductionTrackingProps) {
  const [production, setProduction] = useState<any[]>([])
  const [hens, setHens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    hen_id: '',
    date: new Date().toISOString().split('T')[0],
    eggs: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [refreshTrigger])

  async function loadData() {
    setLoading(true)
    try {
      const [productionData, hensData] = await Promise.all([
        getProduction(),
        getHens(),
      ])
      setProduction(productionData || [])
      setHens(hensData || [])
    } catch (error) {
      console.log('[v0] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddProduction(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addProduction({
        hen_id: formData.hen_id,
        date: formData.date,
        eggs: parseInt(formData.eggs),
        notes: formData.notes || undefined,
      })
      setFormData({
        hen_id: '',
        date: new Date().toISOString().split('T')[0],
        eggs: '',
        notes: '',
      })
      setOpen(false)
      loadData()
    } catch (error) {
      console.log('[v0] Error adding production:', error)
    }
  }

  const totalProduction = production.reduce((sum, p) => sum + (p.eggs || 0), 0)
  const avgDaily = production.length > 0 ? (totalProduction / production.length).toFixed(1) : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rastreamento de Produção</h2>
          <p className="text-gray-600 mt-1">Total: {totalProduction} ovos | Média diária: {avgDaily} ovos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Registrar Produção</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Produção Diária</DialogTitle>
              <DialogDescription>Adicione os ovos coletados do dia</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduction} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Poedeira</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.hen_id}
                  onChange={(e) => setFormData({ ...formData, hen_id: e.target.value })}
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
                <label className="text-sm font-medium">Data da Produção</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ovos Coletados</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.eggs}
                  onChange={(e) => setFormData({ ...formData, eggs: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notas</label>
                <Textarea
                  placeholder="Observações opcionais"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full">
                Registrar Produção
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="pt-6">Carregando...</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {production.length > 0 ? (
                production.map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </p>
                      {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{record.eggs}</p>
                      <p className="text-xs text-gray-500">ovos</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum registro de produção</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
