"use client"

import { DataTable } from "@/components/ui/data-table"
import { IntermediateCheck } from "../lib/schema"
import { useIntermediateChecks } from "../hooks/use-intermediate-checks"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ColumnDef } from "@tanstack/react-table"

interface CheckListProps {
    instrumentId: string
}

export function CheckList({ instrumentId }: CheckListProps) {
    const { data: checks = [], isLoading } = useIntermediateChecks(instrumentId)

    const columns: ColumnDef<IntermediateCheck>[] = [
        {
            accessorKey: "check_date",
            header: "Date",
            cell: ({ row }) => format(new Date(row.original.check_date), 'dd/MM/yyyy')
        },
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }) => (
                <Badge variant={row.original.result === 'passed' ? 'default' : 'destructive'}
                    className={row.original.result === 'passed' ? 'bg-green-600' : ''}>
                    {row.original.result.toUpperCase()}
                </Badge>
            )
        },
        {
            accessorKey: "reference_standard_name",
            header: "Standard Used",
            cell: ({ row }) => row.original.reference_standard_name || '-'
        },
        {
            accessorKey: "notes",
            header: "Notes",
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.notes || '-'}</span>
        },
        {
            accessorKey: "performed_by_name",
            header: "Performing Tech",
        }
    ]

    return (
        <DataTable
            columns={columns}
            data={checks}
            isLoading={isLoading}
            pagination={{ pageIndex: 0, pageSize: 10 }}
        // Simple table, no complex pagination state driven from parent for now
        />
    )
}
