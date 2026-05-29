"use client"

import { useState } from "react"
import { PageHeader } from '@/components/layout/page-header'
import { useAccessLogs } from "@/features/system/access-logs"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { AccessLog } from "@/features/system/access-logs/types"
import { format } from "date-fns"
import { PaginationState } from "@tanstack/react-table"

export default function AccessLogsPage() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    const { data: queryData, isLoading } = useAccessLogs({ 
        page: pagination.pageIndex + 1, 
        per_page: pagination.pageSize 
    })

    const columns: ColumnDef<AccessLog>[] = [
        {
            accessorKey: "created_at",
            header: "Date/Time",
            cell: ({ row }) => {
                const date = row.original.created_at
                return date ? format(new Date(date), 'dd/MM/yyyy HH:mm:ss') : '-'
            }
        },
        {
            accessorKey: "user_name",
            header: "User",
            cell: ({ row }) => row.original.user_name || `User ID: ${row.original.user_id}`
        },
        {
            accessorKey: "station_name",
            header: "Workstation",
            cell: ({ row }) => row.original.station_name || `Station ID: ${row.original.station_id}`
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => <span className="font-medium text-primary">{row.original.action}</span>
        },
        {
            accessorKey: "instrument_name",
            header: "Instrument",
            cell: ({ row }) => row.original.instrument_name || (row.original.instrument_id ? `Inst ID: ${row.original.instrument_id}` : '-')
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Access Logs"
                description="View system access and workstation activity logs"
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
