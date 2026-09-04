"use client"

import { useState } from "react"
import { useReferenceStandardTypes, useDeleteReferenceStandardType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ReferenceStandardType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { StandardTypeForm } from "./standard-type-form"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function StandardTypesList() {
    const t = useTranslations('Settings')
    const tInstruments = useTranslations('Instruments')
    const commonT = useTranslations('Common')

    const { data: types = [], isLoading } = useReferenceStandardTypes()
    const deleteMutation = useDeleteReferenceStandardType()
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ReferenceStandardType | null>(null)

    const handleDelete = async (id: string | number) => {
        if (confirm(commonT('confirm_delete'))) {
            await deleteMutation.mutateAsync(id)
            toast.success(commonT('deleted_success'))
        }
    }

    const columns: ColumnDef<ReferenceStandardType>[] = [
        { 
            accessorKey: "id", 
            header: "ID", 
            size: 50,
            cell: ({ row }) => {
                const id = row.original.id;
                return <span className="text-xs text-muted-foreground">{typeof id === 'string' && id.length > 10 ? id.slice(0, 8) + '...' : id}</span>
            }
        },
        { accessorKey: "name", header: tInstruments('form.name') },
        {
            accessorKey: "calibration_frequency_months",
            header: tInstruments('form.next_calibration'),
            cell: ({ row }) => <span className="text-center block">{row.original.calibration_frequency_months}</span>
        },
        { accessorKey: "description", header: tInstruments('form.description') },
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
                            <Plus className="mr-2 h-4 w-4" /> {editingItem ? commonT('edit') : tInstruments('form.save')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? commonT('edit') : tInstruments('form.description_add')}</DialogTitle>
                        </DialogHeader>
                        <StandardTypeForm
                            initialData={editingItem}
                            onSuccess={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={types}
                    isLoading={isLoading}
                    rowCount={types.length}
                    pagination={{ pageIndex: 0, pageSize: 100 }}
                    onPaginationChange={() => { }}
                />
            </div>
        </div>
    )
}
