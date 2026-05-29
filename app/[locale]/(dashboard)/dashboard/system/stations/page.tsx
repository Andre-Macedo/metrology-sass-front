"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Search, LayoutGrid, List as ListIcon, Loader2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { useStations, useStationMutations, Station, columns, StationCard } from "@/features/system"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PaginationState } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dialog Component
function StationFormDialog({ open, onOpenChange, station }: { open: boolean; onOpenChange: (open: boolean) => void; station?: Station | null }) {
    const t = useTranslations('Stations.form')
    const tV = useTranslations('Validations')
    const tStatus = useTranslations('Stations.status')
    const tTypes = useTranslations('Stations.types')
    const tMessages = useTranslations('Stations.messages')
    
    const { create, update } = useStationMutations()
    
    const stationSchema = z.object({
        name: z.string().min(2, tV('min_characters', { count: 2 })),
        location: z.string().optional(),
        hostname: z.string().optional(),
        ip_address: z.string().optional(),
        type: z.string().min(1, tV('required')),
        status: z.string().min(1, tV('required')),
    })

    type StationFormData = z.infer<typeof stationSchema>

    const form = useForm<StationFormData>({
        resolver: zodResolver(stationSchema),
        defaultValues: { name: "", location: "", hostname: "", ip_address: "", type: "Workstation", status: "Active" },
    })

    useEffect(() => {
        if (station) {
            form.reset({
                name: station.name,
                location: station.location || "",
                hostname: station.hostname || "",
                ip_address: station.ip_address || "",
                type: station.type,
                status: station.status,
            })
        } else {
            form.reset({ name: "", location: "", hostname: "", ip_address: "", type: "Workstation", status: "Active" })
        }
    }, [station, form, open])

    const onSubmit = async (data: StationFormData) => {
        try {
            if (station) {
                await update.mutateAsync({ id: station.id, data })
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{station ? t('edit_station') : t('new_station')}</DialogTitle>
                    <DialogDescription>{t('manage_details')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('name')}</FormLabel>
                                    <FormControl><Input placeholder={t('name_placeholder')} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('type')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Workstation">{tTypes('Workstation')}</SelectItem>
                                                <SelectItem value="Laboratory">{tTypes('Laboratory')}</SelectItem>
                                                <SelectItem value="Production">{tTypes('Production')}</SelectItem>
                                                <SelectItem value="Mobile">{tTypes('Mobile')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('status')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Active">{tStatus('Active')}</SelectItem>
                                                <SelectItem value="Maintenance">{tStatus('Maintenance')}</SelectItem>
                                                <SelectItem value="Inactive">{tStatus('Inactive')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('location')}</FormLabel>
                                        <FormControl><Input placeholder={t('location_placeholder')} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hostname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('hostname')}</FormLabel>
                                        <FormControl><Input placeholder={t('hostname_placeholder')} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="ip_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('ip_address')}</FormLabel>
                                    <FormControl><Input placeholder={t('ip_address_placeholder')} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
export default function StationsPage() {
    const t = useTranslations('Stations')
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })
    const [searchTerm, setSearchTerm] = useState("")

    const { data: queryData, isLoading } = useStations(pagination.pageIndex + 1, searchTerm, pagination.pageSize)
    const deleteMutation = useStationMutations().delete

    const [selected, setSelected] = useState<Station | null>(null)
    const [open, setOpen] = useState(false)

    const handleCreate = () => { setSelected(null); setOpen(true) }
    const handleEdit = (s: Station) => { setSelected(s); setOpen(true) }
    const handleDelete = async (id: number) => {
        if (confirm(t('messages.confirm_delete'))) {
            try {
                await deleteMutation.mutateAsync(id)
                toast.success(t('messages.deleted_success'))
            } catch (error) {
                toast.error("Error")
            }
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader title={t('title')} description={t('description')} />
                <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="grid" className="gap-2">
                                <LayoutGrid className="h-4 w-4" />
                                <span className="hidden sm:inline">Grid</span>
                            </TabsTrigger>
                            <TabsTrigger value="table" className="gap-2">
                                <ListIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Table</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> {t('add_station')}</Button>
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

                {isLoading ? (
                    <div className="flex flex-col h-[40vh] items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Loading workstations...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                        {queryData?.data?.map((station) => (
                            <StationCard 
                                key={station.id} 
                                station={station} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete} 
                            />
                        ))}
                        {queryData?.data?.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                                <p className="text-muted-foreground">{t('table.no_records') || 'No workstations found.'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <DataTable
                            columns={columns(handleEdit, handleDelete)}
                            data={queryData?.data || []}
                            isLoading={isLoading}
                            rowCount={queryData?.total || 0}
                            pagination={pagination}
                            onPaginationChange={setPagination}
                        />
                    </div>
                )}
            </div>

            <StationFormDialog open={open} onOpenChange={setOpen} station={selected} />
        </div>
    )
}
