"use client"

import { useState } from "react"
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { AuditLog } from "@/app/[locale]/(dashboard)/dashboard/metrology/lib/audit-log-schema"
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PaginationState } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export default function GlobalAuditLogsPage() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    const { data: queryData, isLoading } = useQuery({
        queryKey: ['system', 'audit-logs', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: (pagination.pageIndex + 1).toString(),
                per_page: pagination.pageSize.toString()
            })
                
            return await apiClient.get<{ data: AuditLog[]; current_page: number; last_page: number; total: number }>(
                `/system/audit-logs?${queryParams.toString()}`
            )
        },
    })

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "formatted_date",
            header: "Date/Time",
        },
        {
            accessorKey: "user_name",
            header: "User",
        },
        {
            accessorKey: "auditable_type",
            header: "Module/Resource",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.auditable_type || 'System'}</span>
                    <span className="text-xs text-muted-foreground">ID: {row.original.auditable_id || '-'}</span>
                </div>
            )
        },
        {
            accessorKey: "event",
            header: "Event",
            cell: ({ row }) => (
                <Badge variant={
                    row.original.event === 'created' ? 'default' : 
                    row.original.event === 'deleted' ? 'destructive' : 
                    'outline'
                }>
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
                if (log.event === 'deleted') return <span className="text-muted-foreground italic">Record Deleted</span>

                if (!log.new_values) return '-'

                return (
                    <div className="space-y-1 text-sm max-w-md">
                        {Object.entries(log.new_values).slice(0, 3).map(([key, value]) => {
                            const oldValue = log.old_values?.[key]
                            if (!value && !oldValue) return null

                            return (
                                <div key={key} className="grid grid-cols-[auto,1fr] gap-2 items-start">
                                    <span className="font-medium text-muted-foreground">{key}:</span>
                                    <div className="flex flex-col text-xs">
                                        <span className="line-through text-red-400">{String(oldValue ?? 'null')}</span>
                                        <span className="text-green-600 font-semibold">{String(value ?? 'null')}</span>
                                    </div>
                                </div>
                            )
                        })}
                        {Object.keys(log.new_values).length > 3 && (
                            <div className="text-xs text-muted-foreground italic">
                                + {Object.keys(log.new_values).length - 3} more changes
                            </div>
                        )}
                    </div>
                )
            }
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Global Audit Trail"
                description="Comprehensive track of all system changes for compliance and security."
            />
            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={queryData?.data || []}
                    isLoading={isLoading}
                    rowCount={queryData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>
        </div>
    )
}
