"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Search, Download } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { useUsers, User, UserFormDialog, columns } from "@/features/system"
import { UserCompetencesDialog } from "@/features/system/users/user-competences-dialog"
import { Input } from "@/components/ui/input"
import { PaginationState } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

export default function UsersPage() {
    const t = useTranslations('Users')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })
    const [searchTerm, setSearchTerm] = useState("")

    const { data: queryData, isLoading } = useUsers(pagination.pageIndex + 1, searchTerm, pagination.pageSize)

    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [competencesOpen, setCompetencesOpen] = useState(false)

    const handleCreate = () => {
        setSelectedUser(null)
        setDialogOpen(true)
    }

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setDialogOpen(true)
    }

    const handleCompetences = (user: User) => {
        setSelectedUser(user)
        setCompetencesOpen(true)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const handleExport = async () => {
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.set('search', searchTerm)

            const blob = await apiClient.getBlob(`/system/users/export?${params.toString()}`)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `Users_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success("Users report generated!")
        } catch (error) {
            toast.error("Failed to generate export")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title={t('title')}
                    description={t('description')}
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export Excel
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> {t('add_user')}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-9"
                    />
                </div>

                <DataTable
                    columns={columns(handleEdit, handleCompetences)}
                    data={queryData?.data || []}
                    isLoading={isLoading}
                    rowCount={queryData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>

            <UserFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={selectedUser}
            />

            <UserCompetencesDialog
                open={competencesOpen}
                onOpenChange={setCompetencesOpen}
                user={selectedUser}
            />
        </div>
    )
}
