"use client"

import { useState } from "react"
import { useMaterials, useDeleteMaterial } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-materials"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Material } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { MaterialForm } from "./material-form"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function MaterialsList() {
    const t = useTranslations('Settings.materials')
    const commonT = useTranslations('Common')
    
    const { data: materials = [], isLoading } = useMaterials()
    const deleteMutation = useDeleteMaterial()
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Material | null>(null)

    const handleDelete = async (id: number) => {
        if (confirm(commonT('confirm_delete'))) {
            await deleteMutation.mutateAsync(id)
            toast.success(commonT('deleted_success'))
        }
    }

    const columns: ColumnDef<Material>[] = [
        { accessorKey: "id", header: "ID", size: 50 },
        { accessorKey: "name", header: t('name') },
        { 
            accessorKey: "category", 
            header: t('category'),
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.category || '-'}</span>
        },
        {
            accessorKey: "cte",
            header: t('cte'),
            cell: ({ row }) => {
                const val = row.original.cte
                return val ? <span className="font-mono text-primary">{val}</span> : <span>-</span>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setEditingItem(row.original)
                        setOpen(true)
                    }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(row.original.id!)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingItem(null)}>
                            <Plus className="mr-2 h-4 w-4" /> {editingItem ? commonT('edit') : t('add')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? commonT('edit') : t('add')}</DialogTitle>
                        </DialogHeader>
                        <MaterialForm
                            initialData={editingItem}
                            onSuccess={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={materials}
                    isLoading={isLoading}
                    rowCount={materials.length}
                    pagination={{ pageIndex: 0, pageSize: 100 }}
                    onPaginationChange={() => { }}
                />
            </div>
        </div>
    )
}
