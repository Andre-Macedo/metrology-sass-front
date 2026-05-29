"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Calibration } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/lib/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from "@/i18n/routing"
import { downloadFile } from "@/lib/utils"

export const columns: ColumnDef<Calibration>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "instrument_name",
        header: "Instrument",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.instrument_name}</span>
                <span className="text-xs text-muted-foreground">{row.original.instrument_id}</span>
            </div>
        ),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("date") as string
            return date ? new Date(date).toLocaleDateString() : 'N/A'
        }
    },
    {
        accessorKey: "technician",
        header: "Technician",
    },
    {
        accessorKey: "result",
        header: "Result",
        cell: ({ row }) => {
            const result = row.getValue("result") as string
            if (result === 'pass') return <Badge className="bg-green-600">Pass</Badge>
            if (result === 'fail') return <Badge variant="destructive">Fail</Badge>
            if (result === 'conditional_pass') return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Conditional</Badge>
            return <Badge variant="outline">{result}</Badge>
        }
    },
    {
        accessorKey: "next_due_date",
        header: "Next Due",
        cell: ({ row }) => {
            const date = row.getValue("next_due_date") as string
            return date ? new Date(date).toLocaleDateString() : '-'
        }
    },
    {
        id: "certificate",
        header: "Certificate",
        cell: ({ row }) => {
            const cal = row.original
            if (!cal.certificate_url) return null
            return (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => downloadFile(`/calibrations/${cal.id}/pdf`, `Certificate_${cal.id}.pdf`)}
                >
                    <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const calibration = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/metrology/instruments/calibrations/${calibration.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/metrology/instruments/calibrations/${calibration.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* Delete requires passing a handler or using a mutation here. 
                           For simplicity in columns definition, we might skip delete or implement it via a cell component hook.
                           For now keeping it simple. */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
