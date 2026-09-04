"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Instrument } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/lib/schema"
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
import { Checkbox } from "@/components/ui/checkbox"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Link } from "@/i18n/routing"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Status Config mapping
const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
    maintenance: { label: 'Manutenção', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    in_calibration: { label: 'Em Calibração', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    rejected: { label: 'Rejeitado', className: 'bg-destructive/10 text-destructive' },
    lost: { label: 'Perdido', className: 'bg-destructive/10 text-destructive' },
    expired: { label: 'Expirado', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    scrapped: { label: 'Sucateado', className: 'bg-gray-500 text-white' },
    due: { label: 'Vencendo', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
};


export const columns: ColumnDef<Instrument>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
                    Instrument
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const nc = row.original.open_non_conformity
            return (
                <div className="flex items-center gap-2">
                    <div>
                        <div className="font-medium">{row.getValue("name")}</div>
                        <div className="text-xs text-muted-foreground">{row.original.model}</div>
                    </div>
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
        accessorKey: "manufacturer",
        header: "Manufacturer",
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" }

            return (
                <Badge variant="secondary" className={config.className}>
                    {config.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "next_calibration_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Calibration Due
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const dateStr = row.getValue("next_calibration_date") as string
            if (!dateStr || dateStr === "N/A") return <span className="text-muted-foreground text-xs">N/A</span>

            let date;
            try {
                date = parseISO(dateStr)
                // Check if valid date
                if (isNaN(date.getTime())) return <span className="text-muted-foreground text-xs">{dateStr}</span>
            } catch {
                return <span className="text-muted-foreground text-xs">{dateStr}</span>
            }

            const relative = formatDistanceToNow(date, { addSuffix: true })

            // Color coding for relative date can be done here too if desired, 
            // but usually the Status field handles the "Expired" logic.
            // We'll just show the detailed date on hover.

            return (
                <div title={date.toLocaleDateString()} className="whitespace-nowrap">
                    {relative}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const instrument = row.original

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
                            onClick={() => navigator.clipboard.writeText(instrument.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/metrology/instruments/${instrument.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/metrology/instruments/${instrument.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
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
