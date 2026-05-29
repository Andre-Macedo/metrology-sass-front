"use client"

import React, { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { ReceiveModal } from './receive-modal'
import { WorkOrder } from '../types'
import { toast } from 'sonner'

interface KanbanBoardProps {
    initialOrders: WorkOrder[]
    onStatusChange: (id: string, newStatus: string, extraData?: any) => Promise<void>
}

const COLUMNS = [
    { id: 'scheduled', title: 'Agendadas (Coleta)' },
    { id: 'received', title: 'Recebidas' },
    { id: 'in_queue', title: 'Na Fila' },
    { id: 'calibrating', title: 'Em Calibração' },
    { id: 'finished', title: 'Finalizadas' },
]

export function KanbanBoard({ initialOrders, onStatusChange }: KanbanBoardProps) {
    const [orders, setOrders] = useState<WorkOrder[]>(initialOrders)
    const [activeId, setActiveId] = useState<string | null>(null)
    
    // Modal state for logistics
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
    const [pendingTransition, setPendingTransition] = useState<{id: string, status: string} | null>(null)

    useEffect(() => {
        setOrders(initialOrders)
    }, [initialOrders])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const orderId = active.id as string
        const newStatus = over.id as string
        const order = orders.find(o => o.id === orderId)
        
        if (!order || order.status === newStatus || !COLUMNS.some(c => c.id === newStatus)) {
            setActiveId(null)
            return
        }

        // Se estiver movendo para 'received', exige seleção de localização
        if (newStatus === 'received') {
            setPendingTransition({ id: orderId, status: newStatus })
            setIsReceiveModalOpen(true)
            setActiveId(null)
            return
        }

        await processTransition(orderId, newStatus)
        setActiveId(null)
    }

    const processTransition = async (id: string, status: string, extraData: any = {}) => {
        const order = orders.find(o => o.id === id)
        if (!order) return

        const oldStatus = order.status
        // Atualização Otimista
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status, ...extraData } : o))

        try {
            await onStatusChange(id, status, extraData)
            toast.success(`OS ${order.number} atualizada para ${status}`)
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: oldStatus } : o))
            toast.error("Erro ao sincronizar com o servidor.")
        }
    }

    const handleConfirmReceive = async (stationId: string) => {
        if (pendingTransition) {
            await processTransition(pendingTransition.id, 'received', { destination_station_id: stationId })
            setPendingTransition(null)
            setIsReceiveModalOpen(false)
        }
    }

    const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status)
    const activeOrder = activeId ? orders.find(o => o.id === activeId) : null

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px]">
                    {COLUMNS.map(col => (
                        <KanbanColumn key={col.id} id={col.id} title={col.title} count={getOrdersByStatus(col.id).length}>
                            {getOrdersByStatus(col.id).map(order => (
                                <KanbanCard
                                    key={order.id}
                                    id={order.id}
                                    instrumentId={order.item_id}
                                    title={order.number}
                                    instrumentName={order.item?.name || 'Instrumento'}
                                    serialNumber={order.item?.serial_number || 'N/A'}
                                    date={order.created_at}
                                    status={order.status}
                                    technician={order.received_by_name}
                                />
                            ))}
                        </KanbanColumn>
                    ))}
                </div>

                <DragOverlay>
                    {activeId && activeOrder ? (
                        <KanbanCard
                            id={activeId}
                            instrumentId={activeOrder.item_id}
                            title={activeOrder.number}
                            instrumentName={activeOrder.item?.name || 'Instrumento'}
                            serialNumber={activeOrder.item?.serial_number || 'N/A'}
                            date={activeOrder.created_at}
                            status={activeOrder.status}
                            technician={activeOrder.received_by_name}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ReceiveModal 
                isOpen={isReceiveModalOpen}
                onClose={() => { setIsReceiveModalOpen(false); setPendingTransition(null); }}
                onConfirm={handleConfirmReceive}
            />
        </>
    )
}
