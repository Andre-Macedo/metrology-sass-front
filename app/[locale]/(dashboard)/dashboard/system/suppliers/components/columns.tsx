"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Supplier } from "@/features/system/hooks/use-system"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Star } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

export const columns = (onEdit: (supplier: Supplier) => void, onDelete: (id: number) => void): ColumnDef<Supplier>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const t = useTranslations('Suppliers')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tCommon = useTranslations('Common')

    return [
        {
            accessorKey: "name",
            header: t('table.name'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("name")}</span>
                    <span className="text-xs text-muted-foreground">{row.original.cnpj || '-'}</span>
                </div>
            ),
        },
        {
            accessorKey: "contact_person",
            header: t('table.contact'),
        },
        {
            accessorKey: "email",
            header: t('table.email'),
        },
        {
            accessorKey: "phone",
            header: t('table.phone'),
        },
        {
            accessorKey: "status",
            header: t('table.status'),
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === "Approved" ? "default" : status === "Blocked" ? "destructive" : "secondary"}>
                        {t(`status.${status}`) || status}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{row.getValue("rating")}</span>
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const supplier = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{tCommon('open_menu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(supplier)}>
                                <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(supplier.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> {tCommon('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
