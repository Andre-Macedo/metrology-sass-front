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
                <div className="flex items-center gap-1.5">
                    <Badge variant={row.original.result === 'passed' ? 'default' : 'destructive'}
                        className={row.original.result === 'passed' ? 'bg-green-600' : ''}>
                        {row.original.result.toUpperCase()}
                    </Badge>
                    {row.original.result === 'failed' && (
                        <span className="text-[10px] text-destructive font-semibold bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20">
                            Bloqueio & NC
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: "reference_standard_name",
            header: "Standard Used",
            cell: ({ row }) => row.original.reference_standard_name || '-'
        },
        {
            accessorKey: "nominal_value",
            header: "Nominal",
            cell: ({ row }) => row.original.nominal_value !== null && row.original.nominal_value !== undefined ? (
                <span className="font-mono text-xs">{Number(row.original.nominal_value).toFixed(3)}</span>
            ) : '-'
        },
        {
            accessorKey: "measured_value",
            header: "Medido",
            cell: ({ row }) => row.original.measured_value !== null && row.original.measured_value !== undefined ? (
                <span className="font-mono text-xs">{Number(row.original.measured_value).toFixed(3)}</span>
            ) : '-'
        },
        {
            accessorKey: "deviation",
            header: "Desvio (e)",
            cell: ({ row }) => {
                const dev = row.original.deviation
                if (dev === null || dev === undefined) return '-'
                const num = Number(dev)
                return (
                    <span className={`font-mono text-xs font-semibold ${num > 0 ? 'text-blue-600' : num < 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {num > 0 ? `+${num.toFixed(4)}` : num.toFixed(4)}
                    </span>
                )
            }
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
