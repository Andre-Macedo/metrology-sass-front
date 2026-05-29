"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ShieldCheck } from "lucide-react"

export const columns = (
    onEdit: (supplier: Supplier) => void,
    onDelete: (id: number) => void,
    onAccreditation: (supplier: Supplier) => void
): ColumnDef<Supplier>[] => [
    {
        accessorKey: "name",
        header: "Name / Trade Name",
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{supplier.name}</span>
                    {supplier.trade_name && <span className="text-xs text-muted-foreground">{supplier.trade_name}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "cnpj",
        header: "Tax ID (CNPJ)",
    },
    {
        accessorKey: "contact",
        header: "Contact Info",
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex flex-col text-sm">
                    {supplier.contact_person && <span>{supplier.contact_person}</span>}
                    {supplier.email && <span className="text-muted-foreground">{supplier.email}</span>}
                    {supplier.phone && <span className="text-muted-foreground">{supplier.phone}</span>}
                </div>
            )
        }
    },
    {
        accessorKey: "services",
        header: "Services",
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {supplier.is_manufacturer && <Badge variant="outline" className="text-[10px]">Manufacturer</Badge>}
                    {supplier.is_calibration_provider && <Badge variant="outline" className="text-[10px]">Calibration</Badge>}
                    {supplier.is_maintenance_provider && <Badge variant="outline" className="text-[10px]">Maintenance</Badge>}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                    {status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const supplier = row.original

            return (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Accreditation Scope"
                        onClick={() => onAccreditation(supplier)}
                    >
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(supplier)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(supplier.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
