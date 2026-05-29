"use client"

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Gauge, User, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/routing'

interface KanbanCardProps {
    id: string
    title: string
    instrumentId: string
    instrumentName: string
    serialNumber: string
    date: string
    status: string
    technician?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export function KanbanCard({ 
    id, 
    title, 
    instrumentId,
    instrumentName, 
    serialNumber, 
    date, 
    status,
    technician,
    priority = 'medium'
}: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const priorityColors = {
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <Card className={cn(
                "mb-3 shadow-sm hover:shadow-md transition-shadow border-l-4",
                priority === 'urgent' ? 'border-l-red-500' : 'border-l-primary/20'
            )}>
                <CardContent className="p-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold font-mono text-muted-foreground">{title}</span>
                        <div className="flex items-center gap-2">
                            {['received', 'in_queue', 'calibrating'].includes(status) && (
                                <Link 
                                    href={`/dashboard/metrology/calibrations/new?instrument_id=${instrumentId}&work_order_id=${id}`}
                                    className="text-primary hover:text-primary/80 transition-colors pointer-events-auto"
                                    title="Iniciar Calibração"
                                    onClick={(e) => e.stopPropagation()} // Impede o drag ao clicar
                                >
                                    <PlayCircle className="h-5 w-5" />
                                </Link>
                            )}
                            <Badge variant="outline" className={cn("text-[10px] uppercase h-5", priorityColors[priority])}>
                                {priority}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold leading-tight line-clamp-2">{instrumentName}</h4>
                        <p className="text-[10px] text-muted-foreground">SN: {serialNumber}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(date), 'dd/MM/yy')}</span>
                        </div>
                        {technician && (
                            <div className="flex items-center gap-1 text-[10px] font-medium">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[60px]">{technician.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
