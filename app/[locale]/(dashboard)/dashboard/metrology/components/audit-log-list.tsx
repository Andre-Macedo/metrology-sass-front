"use client"

import { DataTable } from "@/components/ui/data-table"
import { AuditLog } from "@/app/[locale]/(dashboard)/dashboard/metrology/lib/audit-log-schema"
import { useAuditLogs } from "@/app/[locale]/(dashboard)/dashboard/metrology/hooks/use-audit-logs"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { ReactNode } from "react"

interface AuditLogListProps {
    auditableType: 'instrument' | 'standard' | 'calibration'
    auditableId: string
}

export function AuditLogList({ auditableType, auditableId }: AuditLogListProps) {
    const { data: logs = [], isLoading } = useAuditLogs({ auditable_type: auditableType, auditable_id: auditableId })

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "formatted_date",
            header: "Date",
        },
        {
            accessorKey: "user_name",
            header: "User",
        },
        {
            accessorKey: "event",
            header: "Action",
            cell: ({ row }) => (
                <Badge variant={row.original.event === 'created' ? 'default' : 'outline'}>
                    {row.original.event.toUpperCase()}
                </Badge>
            )
        },
        {
            id: "changes",
            header: "Changes",
            cell: ({ row }) => {
                const log = row.original
                if (log.event === 'created') return <span className="text-muted-foreground italic">New Record</span>

                if (!log.new_values) return '-'

                return (
                    <div className="space-y-1 text-sm">
                        {Object.entries(log.new_values).map(([key, value]) => {
                            const oldValue = log.old_values?.[key]
                            // Skip if both null or empty
                            if (!value && !oldValue) return null

                            return (
                                <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                                    <span className="font-medium text-muted-foreground justify-self-end">{key}:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="line-through text-red-400 text-xs">{String(oldValue ?? 'null')}</span>
                                        <span>→</span>
                                        <span className="text-green-600 font-semibold">{String(value ?? 'null')}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            }
        },
    ]

    if (isLoading) return <div>Loading logs...</div>

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                No history recorded yet.
            </div>
        )
    }

    return (
        <DataTable
            columns={columns}
            data={logs}
            isLoading={isLoading}
            pagination={{ pageIndex: 0, pageSize: 20 }}
        />
    )
}
