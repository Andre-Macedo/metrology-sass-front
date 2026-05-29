"use client"

import { useState } from "react"
import { useInstrumentTypes, useDeleteInstrumentType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { InstrumentType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { InstrumentTypeForm } from "./instrument-type-form"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"

export function InstrumentTypesList() {
    const t = useTranslations('Instruments')
    const commonT = useTranslations('Common')
    
    const { data: types = [], isLoading } = useInstrumentTypes()
    const deleteMutation = useDeleteInstrumentType()
    const [open, setOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InstrumentType | null>(null)

    const handleDelete = async (id: number) => {
        if (confirm(commonT('confirm_delete'))) {
            await deleteMutation.mutateAsync(id)
            toast.success(commonT('deleted_success'))
        }
    }

    const columns: ColumnDef<InstrumentType>[] = [
        { accessorKey: "id", header: "ID", size: 50 },
        { accessorKey: "name", header: t('form.name') },
        {
            accessorKey: "calibration_frequency_months",
            header: t('form.next_calibration'),
            cell: ({ row }) => <span className="text-center block">{row.original.calibration_frequency_months}</span>
        },
        { 
            accessorKey: "decision_rule", 
            header: t('form.decision_rule'),
            cell: ({ row }) => {
                const rule = row.original.decision_rule || 'simple'
                return (
                    <Badge variant={rule === 'simple' ? 'outline' : rule === 'guard_band' ? 'default' : 'secondary'}>
                        {t(`form.rules.${rule}`)}
                    </Badge>
                )
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
                            <Plus className="mr-2 h-4 w-4" /> {editingItem ? commonT('edit') : t('form.save')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? commonT('edit') : t('form.description_add')}</DialogTitle>
                        </DialogHeader>
                        <InstrumentTypeForm
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
