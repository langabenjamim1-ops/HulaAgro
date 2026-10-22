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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFinancial, addFinancial } from '@/lib/actions'

export default function FinancialReports() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    category: 'feed',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const totalIncome = records
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  const totalExpenses = records
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  const netProfit = totalIncome - totalExpenses

  const expensesByCategory = records
    .filter((r) => r.type === 'expense')
    .reduce((acc: Record<string, number>, r) => {
      acc[r.category] = (acc[r.category] || 0) + (r.amount || 0)
      return acc
    }, {})

  useEffect(() => {
    loadFinancial()
  }, [])

  async function loadFinancial() {
    setLoading(true)
    try {
      const data = await getFinancial()
      setRecords(data || [])
    } catch (error) {
      console.log('[v0] Error loading financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addFinancial({
        category: formData.category,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        date: formData.date,
      })
      setFormData({
        category: 'feed',
        type: 'expense',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      })
      setOpen(false)
      loadFinancial()
    } catch (error) {
      console.log('[v0] Error adding financial record:', error)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      feed: 'Ração',
      medicines: 'Medicamentos',
      equipment: 'Equipamento',
      maintenance: 'Manutenção',
      labor: 'Mão de Obra',
      utilities: 'Utilidades',
      other: 'Outros',
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Registro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
              <DialogDescription>Adicione uma nova entrada ou despesa</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Ração</SelectItem>
                    <SelectItem value="medicines">Medicamentos</SelectItem>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="labor">Mão de Obra</SelectItem>
                    <SelectItem value="utilities">Utilidades</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Valor</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descrição opcional"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Despesa Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700">{getCategoryLabel(category)}</span>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount as number)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimos registros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.length > 0 ? (
                records.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getCategoryLabel(record.category)}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(record.date || record.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'income' ? '+' : '-'}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma transação registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
