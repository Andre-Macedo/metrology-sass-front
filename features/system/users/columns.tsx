"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, GraduationCap } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslations, useLocale } from "next-intl"
import { User } from "../types"

export const columns = (onEdit: (user: User) => void, onCompetences: (user: User) => void): ColumnDef<User>[] => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const t = useTranslations('Users')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tCommon = useTranslations('Common')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const locale = useLocale()

    return [
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
            accessorKey: "name",
            header: t('table.name'),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: t('table.email'),
        },
        {
            accessorKey: "role",
            header: t('table.role'),
            cell: ({ row }) => {
                const user = row.original
                const rawRoleName = user.roles?.[0]?.name || user.role_name || "No Role"
                const roleName = rawRoleName === "No Role" ? t('table.no_role') : (t.has(`roles.${rawRoleName}`) ? t(`roles.${rawRoleName}`) : rawRoleName)
                
                return (
                    <Badge variant="secondary">
                        {roleName}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "created_at",
            header: t('table.created_at'),
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return <div>{date.toLocaleDateString(locale)}</div>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

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
                            <DropdownMenuItem onClick={() => onEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onCompetences(user)}>
                                <GraduationCap className="mr-2 h-4 w-4" /> Training & Competences
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}
