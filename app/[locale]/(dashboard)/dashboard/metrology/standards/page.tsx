"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Download } from 'lucide-react'
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useStandards, useDeleteStandard, ReferenceStandard } from "@/features/standards"
import { PageHeader } from "@/components/layout/page-header"
import { Input } from "@/components/ui/input"
import { StatusTabs } from "@/components/shared/status-tabs"
import { useTranslations } from "next-intl"
import { apiClient } from "@/lib/api/client"

export default function StandardsPage() {
  const t = useTranslations('Standards')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: result, isLoading } = useStandards({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    search: searchQuery,
    type: typeFilter
  })

  const standards = result?.data || []
  const meta = result?.meta

  const deleteMutation = useDeleteStandard()

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [searchQuery, typeFilter])

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

  const handleExport = async () => {
    try {
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (typeFilter !== 'all') params.set('status', typeFilter) 

        const blob = await apiClient.getBlob(`/metrology/standards/export?${params.toString()}`)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Standards_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success("Standards report generated!")
    } catch (error) {
        toast.error("Failed to generate export")
    }
  }

  const columns: ColumnDef<ReferenceStandard>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: t('table.id'),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: t('table.name'),
      cell: ({ row }) => (
        <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.parent_id && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider bg-secondary w-fit px-1 rounded">
                    Child Item
                </span>
            )}
        </div>
      ),
    },
    {
      accessorKey: "serial_number",
      header: t('table.serial_number'),
      cell: ({ row }) => (
          <span className={row.original.parent_id ? "text-muted-foreground italic" : ""}>
              {row.original.effective_serial_number || row.original.serial_number}
          </span>
      )
    },
    {
      accessorKey: "type",
      header: t('table.type'),
      cell: ({ row }) => (
        <Badge variant="outline">{t(`types.${row.original.type}`)}</Badge>
      ),
    },
    {
      accessorKey: "nominal_value",
      header: t('table.nominal_value'),
      cell: ({ row }) => {
          const nominal = row.original.nominal_value
          const actual = row.original.actual_value
          const unit = row.original.unit || ''
          
          if (!nominal && !actual) return <span>-</span>
          
          return (
              <div className="flex flex-col">
                  {actual && actual !== nominal ? (
                      <>
                        <span className="text-xs text-muted-foreground line-through">{nominal} {unit}</span>
                        <span className="font-semibold text-primary">{actual} {unit}</span>
                      </>
                  ) : (
                      <span>{nominal} {unit}</span>
                  )}
              </div>
          )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const std = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{tCommon('open_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/metrology/standards/${std.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {tCommon('view_details')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/metrology/standards/${std.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDelete(std.id)}
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
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
            </Button>
            <Button onClick={() => router.push('/dashboard/metrology/standards/create')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('new_standard')}
            </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <StatusTabs
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={[
              { value: "all", label: t('all_types') },
              { value: "gauge_block", label: t('types.gauge_block') },
              { value: "caliper_checker", label: t('types.caliper_checker') },
              { value: "micrometer_standard", label: t('types.micrometer_standard') },
            ]}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <DataTable
          columns={columns}
          data={standards}
          isLoading={isLoading}
          rowCount={meta?.total || 0}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  )
}
