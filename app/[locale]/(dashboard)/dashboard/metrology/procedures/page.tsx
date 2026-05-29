"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useProcedures, useDeleteProcedure, ChecklistTemplate } from "@/features/procedures"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Input } from '@/components/ui/input'
import { Plus, MoreHorizontal, Edit, Trash2, ListChecks, Search, Eye } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { useTranslations } from "next-intl"


export default function ProceduresPage() {
    const t = useTranslations('Procedures')
    const tCommon = useTranslations('Common')
    const router = useRouter()
    const { data: procedures = [], isLoading } = useProcedures()
    const deleteMutation = useDeleteProcedure()

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    })
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, [searchQuery])

    const handleDelete = async (id: string) => {
        if (confirm(t('messages.confirm_delete'))) {
            try {
                await deleteMutation.mutateAsync(id)
                toast.success(t('messages.deleted_success'))
            } catch (error) {
                toast.error(t('messages.deleted_error'))
            }
        }
    }

    const filteredData = procedures.filter((tpl) => {
        const matchesSearch =
            tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tpl.id && tpl.id.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesSearch
    })

    const columns: ColumnDef<ChecklistTemplate>[] = [
        {
            accessorKey: "id",
            header: t('table.code'),
            cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
        },
        {
            accessorKey: "name",
            header: t('table.name'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-medium">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    {row.original.name}
                </div>
            ),
        },
        {
            id: "steps",
            header: t('table.steps'),
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {t('table.checkpoints', { count: row.original.items.length })}
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const procedure = row.original

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
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/metrology/procedures/${procedure.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> {tCommon('view_details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/metrology/procedures/${procedure.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(procedure.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {tCommon('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
            >
                <Button onClick={() => router.push('/dashboard/metrology/procedures/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('new_procedure')}
                </Button>
            </PageHeader>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            <div className="">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    isLoading={isLoading}
                    rowCount={filteredData.length}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>
        </div>
    )
}
