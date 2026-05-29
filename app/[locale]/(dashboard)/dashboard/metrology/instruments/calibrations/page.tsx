"use client"

import { Button } from "@/components/ui/button"
import { useCalibrations, useDeleteCalibration } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Plus, Search, Download } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { PaginationState } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api/client"

export default function CalibrationsPage() {
    const router = useRouter()

    // State for DataTable
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    })
    const [searchQuery, setSearchQuery] = useState('')

    // Query
    const { data: result, isLoading } = useCalibrations({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search: searchQuery,
        type: 'instrument' // Filter for instruments
    })

    const calibrations = result?.data || []
    const meta = result?.meta

    const handleExport = async () => {
        try {
            const blob = await apiClient.getBlob('/metrology/calibrations/export')
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Calibrations_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success("Calibrations report generated!")
        } catch (error) {
            toast.error("Failed to generate export")
        }
    }

    // Reset page when search changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, [searchQuery])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Calibrations"
                description="History of all executed calibrations"
            >
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button onClick={() => router.push('/dashboard/metrology/instruments/calibrations/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Calibration
                    </Button>
                </div>
            </PageHeader>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by instrument..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="">
                <DataTable
                    columns={columns}
                    data={calibrations}
                    isLoading={isLoading}
                    rowCount={meta?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>
        </div>
    )
}
