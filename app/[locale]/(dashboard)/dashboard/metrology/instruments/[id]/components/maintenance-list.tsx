"use client"

import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wrench, Settings2, ShieldAlert, User, Building2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { MaintenanceRecord } from '@/lib/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MaintenanceListProps {
    instrumentId: string
}

export function MaintenanceList({ instrumentId }: MaintenanceListProps) {
    const { data: records = [], isLoading } = useQuery({
        queryKey: ['metrology', 'instruments', instrumentId, 'maintenance'],
        queryFn: async () => {
            return await apiClient.get<MaintenanceRecord[]>(`/metrology/maintenance?instrument_id=${instrumentId}`)
        }
    })

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'preventive': return <Settings2 className="h-4 w-4 text-blue-500" />
            case 'adjustment': return <ShieldAlert className="h-4 w-4 text-orange-500" />
            default: return <Wrench className="h-4 w-4 text-slate-500" />
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'preventive': return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Preventiva</Badge>
            case 'adjustment': return <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">Ajuste</Badge>
            case 'corrective': return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">Corretiva</Badge>
            default: return <Badge variant="outline">{type}</Badge>
        }
    }

    if (isLoading) return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Carregando histórico...</div>

    if (records.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <Wrench className="mx-auto h-10 w-10 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-semibold">Sem manutenções</h3>
                <p className="text-xs text-muted-foreground mt-1">Este instrumento ainda não passou por intervenções técnicas.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                    <TableRow key={record.id}>
                        <TableCell className="font-medium">
                            {format(new Date(record.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {getTypeIcon(record.type)}
                                {getTypeBadge(record.type)}
                            </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                            <p className="text-sm line-clamp-2">{record.description}</p>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 text-xs">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    {record.technician_name || 'Técnico Interno'}
                                </div>
                                {record.supplier_name && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Building2 className="h-2.5 w-2.5" />
                                        {record.supplier_name}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                            {record.cost ? `R$ ${Number(record.cost).toFixed(2)}` : '-'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
