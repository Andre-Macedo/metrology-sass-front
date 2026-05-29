"use client"

import React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { KanbanBoard } from '@/features/work-orders/components/kanban-board'
import { useWorkOrders, useUpdateWorkOrder } from '@/features/work-orders/hooks/use-work-orders'
import { Loader2, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/routing'

export default function WorkOrdersKanbanPage() {
    const router = useRouter()
    const { data: workOrdersResult, isLoading } = useWorkOrders(1, '', 100) // Busca as OSs
    const updateMutation = useUpdateWorkOrder()

    const workOrders = (workOrdersResult as any)?.data || []

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateMutation.mutateAsync({ 
            id, 
            data: { status: newStatus } 
        })
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader 
                    title="Fluxo de Trabalho (Kanban)" 
                    description="Gerencie o ciclo de vida das Ordens de Serviço visualmente."
                />
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/metrology/work-orders')}>
                        <List className="mr-2 h-4 w-4" />
                        Ver como Lista
                    </Button>
                    <Button variant="secondary" size="sm" disabled>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Kanban
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-1 items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard 
                        initialOrders={workOrders} 
                        onStatusChange={handleStatusChange} 
                    />
                </div>
            )}
        </div>
    )
}
