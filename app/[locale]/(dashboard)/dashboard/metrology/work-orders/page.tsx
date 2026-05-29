"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { useWorkOrders } from "@/features/work-orders"
import { PaginationState } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"
import { WorkOrder } from "@/features/work-orders/types"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useTranslations, useLocale } from "next-intl"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WorkOrderForm } from "@/features/work-orders/components/work-order-form"

export default function WorkOrdersPage() {
    const t = useTranslations('WorkOrders')
    const tCommon = useTranslations('Common')
    const locale = useLocale()
    
    const [search, setSearch] = useState("")
    const [open, setOpen] = useState(false)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    const { data: queryData, isLoading } = useWorkOrders({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search
    })

    const workOrders = queryData?.data || []

    const columns: ColumnDef<WorkOrder>[] = [
        {
            accessorKey: "number",
            header: t('table.number'),
            cell: ({ row }) => <span className="font-mono font-medium">{row.original.number}</span>
        },
        {
            accessorKey: "item",
            header: t('table.item'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.item_name || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.item_type.split('\\').pop()}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: t('table.status'),
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge variant={
                        status === 'finished' || status === 'dispatched' ? 'default' :
                        status === 'calibrating' ? 'secondary' :
                        status === 'in_queue' ? 'outline' : 'destructive'
                    }>
                        {status.replace('_', ' ').toUpperCase()}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "received_by",
            header: t('table.received_by'),
            cell: ({ row }) => <span>{row.original.received_by_name || '-'}</span>
        },
        {
            accessorKey: "created_at",
            header: t('table.date'),
            cell: ({ row }) => <span>{format(new Date(row.original.created_at), 'dd/MM/yyyy')}</span>
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                        {tCommon('view_details')}
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title={t('title')}
                    description={t('description')}
                />
                <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t('check_in')}
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={tCommon('search')}
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <DataTable
                    columns={columns}
                    data={workOrders}
                    isLoading={isLoading}
                    rowCount={queryData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('check_in')}</DialogTitle>
                        <DialogDescription>
                            Create a new work order for an incoming instrument.
                        </DialogDescription>
                    </DialogHeader>
                    <WorkOrderForm onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
