"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Station } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

export const columns = (
    onEdit: (station: Station) => void,
    onDelete: (id: number) => void
): ColumnDef<Station>[] => [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.type
            return <Badge variant="outline">{type}</Badge>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge variant={status === 'Active' ? 'default' : status === 'Maintenance' ? 'warning' : 'secondary'}>
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "hostname",
        header: "Hostname",
    },
    {
        accessorKey: "ip_address",
        header: "IP Address",
        cell: ({ row }) => {
            const ip = row.original.ip_address
            return ip ? <span className="font-mono text-xs">{ip}</span> : <span className="text-muted-foreground">-</span>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const station = row.original

            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(station)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(station.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
