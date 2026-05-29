'use client'

import { useState, Suspense, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, FileSpreadsheet, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './components/columns'
import { StatusTabs } from '@/components/shared/status-tabs'
import { PaginationState } from '@tanstack/react-table'
import { useInstruments } from '@/features/instruments'
import { useTranslations, useLocale } from 'next-intl'
import { ptBR, enUS } from 'date-fns/locale'
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"
import { Loader2, Printer } from "lucide-react"
import { ExcelImportModal } from '@/features/instruments/components/excel-import-modal'
import { useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/export-excel'
import { useRouter } from "@/i18n/routing"

export default function InstrumentsPage() {
  const t = useTranslations('Instruments')
  const tCommon = useTranslations('Common')
  const locale = useLocale()
  const queryClient = useQueryClient()
  
  // Map next-intl locale to date-fns locale
  const dateLocale = locale === 'pt-BR' ? ptBR : enUS

  const router = useRouter()
  const searchParams = useSearchParams()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })
  const [isPrintingBatch, setIsPrintingBatch] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // URL state management
  const currentStatus = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('search') || ''

  const { data: result, isLoading } = useInstruments({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    search: currentSearch,
    status: currentStatus,
  })

  // Safe access to data and meta
  const instruments = result?.data || []
  const meta = result?.meta

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.set('page', '1')
    router.push(`/dashboard/metrology/instruments?${params.toString()}`)
  }

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/dashboard/metrology/instruments?${params.toString()}`)
  }

  const handleBatchPrint = async (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return

    const ids = selectedRows.map((row: any) => row.original.id).join(',')
    
    setIsPrintingBatch(true)
    try {
        const blob = await apiClient.getBlob(`/instruments/batch/labels?ids=${ids}`)
        const url = window.URL.createObjectURL(blob)

        const printWindow = window.open(url, '_blank')
        if (!printWindow) {
            toast.error("Please allow popups to print the labels")
        }

        setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (error) {
        console.error('Failed to print batch labels:', error)
        toast.error("Failed to download labels")
    } finally {
        setIsPrintingBatch(false)
        table.toggleAllRowsSelected(false)
    }
  }

  const handleExport = async () => {
    try {
        const params = new URLSearchParams()
        if (currentSearch) params.set('search', currentSearch)
        if (currentStatus !== 'all') params.set('status', currentStatus)

        // Using getBlob from apiClient to handle the binary Excel file
        const blob = await apiClient.getBlob(`/metrology/instruments/export?${params.toString()}`)
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Instruments_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        window.URL.revokeObjectURL(url)
        toast.success("Professional report generated!")
    } catch (error) {
        console.error('Export failed:', error)
        toast.error("Failed to generate server-side report")
    }
  }

  // Memoize columns
  const instrumentColumns = useMemo(() => columns, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import Excel
            </Button>
            <Button onClick={() => router.push(`/dashboard/metrology/instruments/create`)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('add_instrument')}
            </Button>
          </div>
        </PageHeader>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('search_placeholder')}
                defaultValue={currentSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <StatusTabs
              value={currentStatus}
              onValueChange={handleStatusChange}
              options={[
                { value: 'all', label: t('status.all') },
                { value: 'active', label: t('status.active') },
                { value: 'due', label: t('status.due_soon') },
                { value: 'expired', label: t('status.expired') },
                { value: 'in_calibration', label: t('status.in_calibration') },
              ]}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <DataTable
            columns={instrumentColumns}
            data={instruments}
            isLoading={isLoading}
            rowCount={meta?.total || 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            renderBulkActions={(table) => {
                const selectedCount = table.getFilteredSelectedRowModel().rows.length
                if (selectedCount === 0) return null
                return (
                    <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleBatchPrint(table)}
                        disabled={isPrintingBatch}
                    >
                        {isPrintingBatch ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Printer className="mr-2 h-4 w-4" />
                        )}
                        Print Labels ({selectedCount})
                    </Button>
                )
            }}
          />
        </div>

        <ExcelImportModal 
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['instruments'] })
            }}
        />
      </div>
    </Suspense>
  )
}
