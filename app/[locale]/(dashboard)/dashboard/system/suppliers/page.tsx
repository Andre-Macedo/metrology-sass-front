"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { useSuppliers, useSupplierMutations, Supplier, columns } from "@/features/system"
import { SupplierAccreditationsDialog } from "@/features/system/suppliers/supplier-accreditations-dialog"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PaginationState } from "@tanstack/react-table"
import { useTranslations } from "next-intl"

// Dialog Component
function SupplierFormDialog({ open, onOpenChange, supplier }: { open: boolean; onOpenChange: (open: boolean) => void; supplier?: Supplier | null }) {
    const t = useTranslations('Suppliers.form')
    const tV = useTranslations('Validations')
    const tStatus = useTranslations('Suppliers.status')
    const tMessages = useTranslations('Suppliers.messages')
    
    const { create, update } = useSupplierMutations()
    
    const supplierSchema = z.object({
        name: z.string().min(2, tV('min_characters', { count: 2 })),
        trade_name: z.string().optional(),
        cnpj: z.string().optional(),
        contact_person: z.string().optional(),
        email: z.string().email(tV('invalid_email')).optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(['active', 'inactive']),
        is_manufacturer: z.boolean().default(false),
        is_calibration_provider: z.boolean().default(false),
        is_maintenance_provider: z.boolean().default(false),
        rbc_code: z.string().optional(),
        accreditation_valid_until: z.string().optional(),
    })

    type SupplierFormData = z.infer<typeof supplierSchema>

    const form = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: "", trade_name: "", cnpj: "", contact_person: "", email: "", phone: "", address: "",
            status: "active",
            is_manufacturer: false, is_calibration_provider: false, is_maintenance_provider: false,
            rbc_code: "", accreditation_valid_until: ""
        },
    })

    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name,
                trade_name: supplier.trade_name || "",
                cnpj: supplier.cnpj || "",
                contact_person: supplier.contact_person || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                status: (supplier.status === 'active' || supplier.status === 'inactive') ? supplier.status : 'active',
                is_manufacturer: supplier.is_manufacturer,
                is_calibration_provider: supplier.is_calibration_provider,
                is_maintenance_provider: supplier.is_maintenance_provider,
                rbc_code: supplier.rbc_code || "",
                accreditation_valid_until: supplier.accreditation_valid_until || "",
            })
        } else {
            form.reset({ 
                name: "", trade_name: "", cnpj: "", contact_person: "", email: "", phone: "", address: "",
                status: "active", 
                is_manufacturer: false, is_calibration_provider: false, is_maintenance_provider: false,
                rbc_code: "", accreditation_valid_until: ""
            })
        }
    }, [supplier, form, open])

    const onSubmit = async (data: SupplierFormData) => {
        try {
            if (supplier) {
                await update.mutateAsync({ id: supplier.id, data })
                toast.success(tMessages('updated_success'))
            } else {
                await create.mutateAsync(data)
                toast.success(tMessages('created_success'))
            }
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error(tMessages('save_error'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{supplier ? t('edit_supplier') : t('new_supplier')}</DialogTitle>
                    <DialogDescription>{t('description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>{t('name')}</FormLabel><FormControl><Input placeholder={t('name_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="trade_name" render={({ field }) => (
                                <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input placeholder="Ex: Metrologia XYZ" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="cnpj" render={({ field }) => (
                                <FormItem><FormLabel>{t('tax_id')}</FormLabel><FormControl><Input placeholder={t('tax_id_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="contact_person" render={({ field }) => (
                                <FormItem><FormLabel>{t('contact_person')}</FormLabel><FormControl><Input placeholder={t('contact_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>{t('email')}</FormLabel><FormControl><Input placeholder={t('email_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>{t('phone')}</FormLabel><FormControl><Input placeholder={t('phone_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>{t('address')}</FormLabel><FormControl><Input placeholder="Endereço Completo" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>{t('status')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">{tStatus('Active')}</SelectItem>
                                            <SelectItem value="inactive">{tStatus('Inactive')}</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <div className="flex gap-6 mt-2">
                            <FormField control={form.control} name="is_manufacturer" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel>Fabricante</FormLabel></div>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="is_calibration_provider" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel>Laboratório Calibração</FormLabel></div>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="is_maintenance_provider" render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none"><FormLabel>Manutenção</FormLabel></div>
                                </FormItem>
                            )} />
                        </div>

                        {/* Acreditação */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                            <FormField control={form.control} name="rbc_code" render={({ field }) => (
                                <FormItem><FormLabel>Código de Acreditação (RBC)</FormLabel><FormControl><Input placeholder="Ex: CAL-0123" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="accreditation_valid_until" render={({ field }) => (
                                <FormItem><FormLabel>Validade Acreditação</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        <DialogFooter>
                            <Button type="submit">{t('save')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

// Page Component
export default function SuppliersPage() {
    const t = useTranslations('Suppliers')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })
    const [searchTerm, setSearchTerm] = useState("")

    const { data: queryData, isLoading } = useSuppliers(pagination.pageIndex + 1, searchTerm, pagination.pageSize)
    const deleteMutation = useSupplierMutations().delete

    const [selected, setSelected] = useState<Supplier | null>(null)
    const [open, setOpen] = useState(false)
    const [accreditationsOpen, setAccreditationsOpen] = useState(false)

    const handleCreate = () => { setSelected(null); setOpen(true) }
    const handleEdit = (s: Supplier) => { setSelected(s); setOpen(true) }
    const handleAccreditations = (s: Supplier) => { setSelected(s); setAccreditationsOpen(true) }
    
    const handleDelete = async (id: number) => {
        if (confirm(t('messages.confirm_delete') || "Are you sure?")) {
            await deleteMutation.mutateAsync(id)
            toast.success(t('messages.deleted_success'))
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader title={t('title')} description={t('description')} />
                <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> {t('add_supplier')}</Button>
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
                    columns={columns(handleEdit, handleDelete, handleAccreditations)}
                    data={queryData?.data || []}
                    isLoading={isLoading}
                    rowCount={queryData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>

            <SupplierFormDialog open={open} onOpenChange={setOpen} supplier={selected} />
            <SupplierAccreditationsDialog 
                open={accreditationsOpen} 
                onOpenChange={setAccreditationsOpen} 
                supplier={selected} 
            />
        </div>
    )
}
