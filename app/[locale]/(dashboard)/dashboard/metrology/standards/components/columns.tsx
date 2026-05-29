"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ReferenceStandard } from "../lib/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Eye, Edit, Trash2, AlertTriangle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Type labels mapping
const typeLabels: Record<string, string> = {
    gauge_block: 'Gauge Block Set',
    caliper_checker: 'Caliper Checker',
    micrometer_standard: 'Micrometer Standard',
    other: 'Other'
}

export const columns: ColumnDef<ReferenceStandard>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const nc = row.original.open_non_conformity
            return (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{row.getValue("name")}</div>
                    {nc && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link href={`/dashboard/metrology/non-conformities/${nc.id}`}>
                                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full animate-pulse">
                                            <AlertTriangle className="h-3 w-3" />
                                        </Badge>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Open NC: {nc.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "serial_number",
        header: "Serial Number",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string
            const label = typeLabels[type] || type

            return (
                <Badge variant="outline">
                    {label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "nominal_value",
        header: "Nominal Value",
        cell: ({ row }) => row.getValue("nominal_value") || "-"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const standard = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(standard.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={`/dashboard/metrology/standards/${standard.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`/dashboard/metrology/standards/${standard.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
