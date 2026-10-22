'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import { getHens, addHen, updateHen, deleteHen } from '@/lib/actions'

interface HenManagementProps {
  refreshTrigger: number
}

export default function HenManagement({ refreshTrigger }: HenManagementProps) {
  const [hens, setHens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    tag: '',
    breed: '',
    status: 'active',
  })

  useEffect(() => {
    loadHens()
  }, [refreshTrigger])

  async function loadHens() {
    setLoading(true)
    try {
      const data = await getHens()
      setHens(data || [])
    } catch (error) {
      console.log('[v0] Error loading hens:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddHen(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addHen({
        tag: formData.tag,
        breed: formData.breed,
        status: formData.status,
      })
      setFormData({ tag: '', breed: '', status: 'active' })
      setOpen(false)
      loadHens()
    } catch (error) {
      console.log('[v0] Error adding hen:', error)
    }
  }

  async function handleUpdateStatus(henId: string, newStatus: string) {
    try {
      await updateHen(henId, { status: newStatus })
      loadHens()
    } catch (error) {
      console.log('[v0] Error updating hen:', error)
    }
  }

  async function handleDeleteHen(henId: string) {
    try {
      await deleteHen(henId)
      loadHens()
    } catch (error) {
      console.log('[v0] Error deleting hen:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'sick':
        return 'bg-red-100 text-red-800'
      case 'resting':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Poedeiras</h2>
          <p className="text-gray-600 mt-1">Total: {hens.length} galinhas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Nova Poedeira</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Poedeira</DialogTitle>
              <DialogDescription>Adicione uma nova galinha ao seu rebanho</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddHen} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Número de Tag</label>
                <Input
                  placeholder="Ex: HEN-001"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Raça</label>
                <Input
                  placeholder="Ex: Poedeira Branca"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="resting">Descansando</SelectItem>
                    <SelectItem value="sick">Doente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Adicionar Poedeira
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="pt-6">Carregando...</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hens.map((hen) => (
            <Card key={hen.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{hen.tag}</CardTitle>
                    <CardDescription>{hen.breed}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(hen.status)}>
                    {hen.status === 'active' && 'Ativa'}
                    {hen.status === 'resting' && 'Descansando'}
                    {hen.status === 'sick' && 'Doente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {hen.id.slice(0, 8)}</p>
                  <p><span className="font-medium">Raça:</span> {hen.breed}</p>
                  <div className="pt-4 flex gap-2">
                    <Select defaultValue={hen.status} onValueChange={(value) => handleUpdateStatus(hen.id, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="resting">Descansando</SelectItem>
                        <SelectItem value="sick">Doente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteHen(hen.id)}>
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
