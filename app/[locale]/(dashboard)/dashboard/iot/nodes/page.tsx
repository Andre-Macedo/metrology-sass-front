'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus, cpu, MoreHorizontal, Edit, Trash2, Package } from 'lucide-react'
import { IoTNode } from '@/lib/types'
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

export default function NodesPage() {
  const [nodes, setNodes] = useState<IoTNode[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    fetchNodes()
  }, [])

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
          <Badge variant={status === 'active' || status === 'online' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => toast.error('Funcionalidade em desenvolvimento')}
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
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
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
    </div>
  )
}
