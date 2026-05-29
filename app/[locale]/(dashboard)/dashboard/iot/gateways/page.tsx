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

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<IoTGateway[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
          <Badge variant={status === 'online' ? 'success' : 'secondary'}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'last_at',
      header: 'Última Atividade',
      cell: ({ row }: any) => {
        const date = row.getValue('last_at')
        return date ? new Date(date).toLocaleString() : 'Nunca'
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
        title="Gateways IoT"
        description="Gerencie os gateways que conectam seus sensores ao sistema."
      >
        <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
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
    </div>
  )
}
