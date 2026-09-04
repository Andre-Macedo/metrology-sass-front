'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Monitor, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { IoTGateway } from '@/lib/types'
import { apiClient } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<IoTGateway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGateway, setEditingGateway] = useState<IoTGateway | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [status, setStatus] = useState('online')

  const fetchGateways = async () => {
    try {
      setIsLoading(true)
      const response: any = await apiClient.get('/iot-gateways')
      setGateways(response.data || [])
    } catch (error) {
      console.error('Failed to fetch gateways:', error)
      toast.error('Falha ao carregar gateways')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGateways()
  }, [])

  const openCreateDialog = () => {
    setEditingGateway(null)
    setName('')
    setDeviceId('')
    setStatus('online')
    setIsDialogOpen(true)
  }

  const openEditDialog = (gateway: IoTGateway) => {
    setEditingGateway(gateway)
    setName(gateway.name)
    setDeviceId(gateway.device_id)
    setStatus(gateway.status)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingGateway) {
        await apiClient.put(`/iot-gateways/${editingGateway.id}`, { name, device_id: deviceId, status })
        toast.success('Gateway atualizado com sucesso!')
      } else {
        await apiClient.post('/iot-gateways', { name, device_id: deviceId, status })
        toast.success('Gateway criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchGateways()
    } catch (error) {
      console.error('Error saving gateway:', error)
      toast.error('Erro ao salvar gateway')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este gateway?')) return
    try {
      await apiClient.delete(`/iot-gateways/${id}`)
      toast.success('Gateway excluído com sucesso!')
      fetchGateways()
    } catch (error) {
      console.error('Error deleting gateway:', error)
      toast.error('Erro ao excluir gateway')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'device_id',
      header: 'Device ID',
      cell: ({ row }: any) => (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{row.getValue('device_id')}</code>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status')
        return (
          <Badge variant={status === 'online' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const gateway = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(gateway)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(gateway.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gateways IoT"
        description="Gerencie os gateways que conectam seus sensores ao sistema."
      >
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Novo Gateway
        </Button>
      </PageHeader>

      <div className="rounded-md border bg-card">
        <DataTable 
          columns={columns} 
          data={gateways} 
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGateway ? 'Editar Gateway' : 'Novo Gateway'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do gateway IoT.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Gateway</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Gateway Setor A" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device_id">Device ID (MAC ou Serial)</Label>
              <Input 
                id="device_id" 
                value={deviceId} 
                onChange={(e) => setDeviceId(e.target.value)} 
                placeholder="Ex: GW-001" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
