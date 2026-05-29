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

export function StandardTypesList() {
    const { data: types = [], isLoading } = useReferenceStandardTypes()
    const deleteMutation = useDeleteReferenceStandardType()
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ReferenceStandardType | null>(null)

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure? This might affect existing standards.")) {
            await deleteMutation.mutateAsync(id)
            toast.success("Type deleted")
        }
    }

    const columns: ColumnDef<ReferenceStandardType>[] = [
        { accessorKey: "id", header: "ID", size: 50 },
        { accessorKey: "name", header: "Name" },
        {
            accessorKey: "calibration_frequency_months",
            header: "Frequency (Months)",
            cell: ({ row }) => <span className="text-center block">{row.original.calibration_frequency_months}</span>
        },
        // Description is optional
        { accessorKey: "description", header: "Description" },
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
                            <Plus className="mr-2 h-4 w-4" /> Add Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit Standard Type' : 'New Standard Type'}</DialogTitle>
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
