"use client"

import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
import { toast } from "sonner"
import { Supplier } from "../types"
import { useSupplierAccreditations, useSyncSupplierAccreditations } from "../hooks/use-system"
import { useInstrumentTypes } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { Loader2 } from "lucide-react"

export function SupplierAccreditationsDialog({ open, onOpenChange, supplier }: { open: boolean, onOpenChange: (open: boolean) => void, supplier?: Supplier | null }) {
    const { data: accreditations, isLoading: loadingAccreditations } = useSupplierAccreditations(supplier?.id || null)
    const { data: instrumentTypes = [], isLoading: loadingTypes } = useInstrumentTypes()
    const syncMutation = useSyncSupplierAccreditations()

    const formSchema = z.object({
        accreditations: z.array(z.object({
            instrument_type_id: z.number(),
            instrument_type_name: z.string(),
            selected: z.boolean(),
            range: z.string().nullable().optional(),
            uncertainty: z.string().nullable().optional()
        }))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accreditations: []
        },
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "accreditations",
    })

    useEffect(() => {
        if (open && instrumentTypes.length > 0) {
            const mapped = instrumentTypes.map(type => {
                const existing = accreditations?.find((a: any) => a.instrument_type_id === type.id)
                return {
                    instrument_type_id: type.id!,
                    instrument_type_name: type.name,
                    selected: !!existing,
                    range: existing?.range || "",
                    uncertainty: existing?.uncertainty || ""
                }
            })
            form.reset({ accreditations: mapped })
        }
    }, [open, instrumentTypes, accreditations, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!supplier) return

        try {
            const selectedAccreditations = values.accreditations
                .filter(a => a.selected)
                .map(a => ({
                    instrument_type_id: a.instrument_type_id,
                    range: a.range || null,
                    uncertainty: a.uncertainty || null
                }))

            await syncMutation.mutateAsync({ supplierId: supplier.id, accreditations: selectedAccreditations })
            toast.success("Supplier accreditation scope updated successfully")
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update accreditation scope")
        }
    }

    const isLoading = loadingAccreditations || loadingTypes

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Accreditation Scope (ISO 17025)</DialogTitle>
                    <DialogDescription>
                        Define the measurement areas and ranges {supplier?.name} is accredited for.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                                            <th className="p-3 text-left w-12">Accred.</th>
                                            <th className="p-3 text-left">Instrument Type</th>
                                            <th className="p-3 text-left w-48">CMC Range</th>
                                            <th className="p-3 text-left w-48">Best Uncertainty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => (
                                            <tr key={field.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="p-3 text-center">
                                                    <FormField
                                                        control={form.control}
                                                        name={`accreditations.${index}.selected`}
                                                        render={({ field }) => (
                                                            <FormControl>
                                                                <Checkbox 
                                                                    checked={field.value} 
                                                                    onCheckedChange={field.onChange} 
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {field.instrument_type_name}
                                                </td>
                                                <td className="p-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`accreditations.${index}.range`}
                                                        render={({ field: inputField }) => (
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="0 to 150 mm"
                                                                    className="h-8 text-xs" 
                                                                    disabled={!form.watch(`accreditations.${index}.selected`)}
                                                                    {...inputField}
                                                                    value={inputField.value || ''}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`accreditations.${index}.uncertainty`}
                                                        render={({ field: inputField }) => (
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="0.005 mm"
                                                                    className="h-8 text-xs font-mono" 
                                                                    disabled={!form.watch(`accreditations.${index}.selected`)}
                                                                    {...inputField}
                                                                    value={inputField.value || ''}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={syncMutation.isPending}>
                                    {syncMutation.isPending ? "Saving..." : "Update Accreditation Scope"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
