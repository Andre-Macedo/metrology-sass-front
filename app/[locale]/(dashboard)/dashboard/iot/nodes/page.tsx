'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Cpu, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react'
import { IoTNode, IoTGateway } from '@/lib/types'
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

export default function NodesPage() {
  const [nodes, setNodes] = useState<IoTNode[]>([])
  const [gateways, setGateways] = useState<IoTGateway[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<IoTNode | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [nodeId, setNodeId] = useState('')
  const [status, setStatus] = useState('online')
  const [gatewayId, setGatewayId] = useState('')
  const [machineId, setMachineId] = useState('')

  const fetchNodes = async () => {
    try {
      setIsLoading(true)
      const response: any = await apiClient.get('/iot-nodes')
      setNodes(response.data || [])
    } catch (error) {
      console.error('Failed to fetch nodes:', error)
      toast.error('Falha ao carregar nodes')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const [gatewaysRes, machinesRes] = await Promise.all([
        apiClient.get('/iot-gateways'),
        apiClient.get('/system/machines')
      ])
      setGateways((gatewaysRes as any).data || [])
      setMachines((machinesRes as any).data || [])
    } catch (error) {
      console.error('Failed to fetch dependencies:', error)
    }
  }

  useEffect(() => {
    fetchNodes()
    fetchDependencies()
  }, [])

  const openCreateDialog = () => {
    setEditingNode(null)
    setName('')
    setNodeId('')
    setStatus('online')
    setGatewayId('')
    setMachineId('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (node: IoTNode) => {
    setEditingNode(node)
    setName(node.name)
    setNodeId(node.node_id)
    setStatus(node.status)
    setGatewayId(node.gateway_id || '')
    setMachineId(node.machine_id || '')
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!gatewayId) {
      toast.error('O Node precisa estar vinculado a um Gateway.')
      return
    }

    try {
      const payload = {
        name,
        node_id: nodeId,
        status,
        gateway_id: gatewayId,
        machine_id: machineId || null,
      }

      if (editingNode) {
        await apiClient.put(`/iot-nodes/${editingNode.id}`, payload)
        toast.success('Node atualizado com sucesso!')
      } else {
        await apiClient.post('/iot-nodes', payload)
        toast.success('Node criado com sucesso!')
      }
      setIsDialogOpen(false)
      fetchNodes()
    } catch (error) {
      console.error('Error saving node:', error)
      toast.error('Erro ao salvar node')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este node? O histórico de telemetria pode ser afetado.')) return
    try {
      await apiClient.delete(`/iot-nodes/${id}`)
      toast.success('Node excluído com sucesso!')
      fetchNodes()
    } catch (error) {
      console.error('Error deleting node:', error)
      toast.error('Erro ao excluir node')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nome do Sensor',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'node_id',
      header: 'Node ID',
      cell: ({ row }: any) => (
        <code className="text-xs bg-muted px-1 py-0.5 rounded">{row.getValue('node_id')}</code>
      ),
    },
    {
      id: 'machine',
      header: 'Máquina Atrelada',
      cell: ({ row }: any) => {
        const machine = row.original.machine
        return machine ? machine.name : <span className="text-muted-foreground italic">Nenhuma</span>
      },
    },
    {
      id: 'gateway',
      header: 'Gateway',
      cell: ({ row }: any) => {
        const gateway = row.original.gateway
        return gateway ? gateway.name : <span className="text-muted-foreground italic">Nenhum</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status')
        return (
          <Badge variant={status === 'active' || status === 'online' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const node = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openEditDialog(node)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDelete(node.id)}
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
        title="Nodes e Sensores"
        description="Gerencie os sensores instalados em suas máquinas."
      >
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Novo Node
        </Button>
      </PageHeader>

      <div className="rounded-md border bg-card">
        <DataTable 
          columns={columns} 
          data={nodes} 
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNode ? 'Editar Node/Sensor' : 'Novo Node/Sensor'}</DialogTitle>
            <DialogDescription>
              Vincule um sensor a um Gateway e a uma Máquina.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Sensor</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Sensor Motor Principal" 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="node_id">Node ID (MAC ou Identificador)</Label>
              <Input 
                id="node_id" 
                value={nodeId} 
                onChange={(e) => setNodeId(e.target.value)} 
                placeholder="Ex: NODE-01" 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gateway">Gateway (Obrigatório)</Label>
              <Select value={gatewayId} onValueChange={setGatewayId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gateway" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map(gw => (
                    <SelectItem key={gw.id} value={gw.id}>{gw.name} ({gw.device_id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="machine">Máquina (Opcional)</Label>
              <Select value={machineId} onValueChange={(val) => setMachineId(val === 'none' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a máquina monitorada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Nenhuma Máquina --</SelectItem>
                  {machines.map(mac => (
                    <SelectItem key={mac.id} value={mac.id}>{mac.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
