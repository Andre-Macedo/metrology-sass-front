"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Station } from "@/lib/hooks/use-system"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"

export const columns = (onEdit: (station: Station) => void, onDelete: (id: number) => void): ColumnDef<Station>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const t = useTranslations('Stations')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tCommon = useTranslations('Common')

    return [
        {
            accessorKey: "name",
            header: t('table.name'),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "type",
            header: t('table.type'),
            cell: ({ row }) => {
                const type = row.getValue("type") as string
                return <span>{t(`types.${type}`) || type}</span>
            }
        },
        {
            accessorKey: "location",
            header: t('table.location'),
        },
        {
            accessorKey: "hostname",
            header: t('table.hostname'),
            cell: ({ row }) => <code className="text-xs bg-muted p-1 rounded">{row.getValue("hostname") || '-'}</code>,
        },
        {
            accessorKey: "status",
            header: t('table.status'),
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === "Active" ? "default" : "secondary"}>
                        {t(`status.${status}`) || status}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const station = row.original

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
                            <DropdownMenuItem onClick={() => onEdit(station)}>
                                <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(station.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> {tCommon('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
