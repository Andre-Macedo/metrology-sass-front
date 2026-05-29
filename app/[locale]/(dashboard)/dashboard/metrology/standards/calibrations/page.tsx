"use client"

import { Button } from "@/components/ui/button"
import { useCalibrations } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations"
import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { PaginationState } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"

export default function StandardCalibrationsPage() {
    const router = useRouter()

    // State for DataTable
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 15,
    })
    const [searchQuery, setSearchQuery] = useState('')

    // Query with filter for 'standard' type (assuming backend validation/mapping)
    const { data: result, isLoading } = useCalibrations({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
        search: searchQuery,
        type: 'reference_standard' // Using internal backend model name usually, or just 'standard'
    })

    const calibrations = result?.data || []
    const meta = result?.meta

    // Reset page when search changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, [searchQuery])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Standard Calibrations"
                description="Calibration history for reference standards"
            />

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID or Name..."
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
