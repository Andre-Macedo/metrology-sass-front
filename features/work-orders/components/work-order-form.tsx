"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { WorkOrderFormData, workOrderFormDataSchema } from "../types"
import { useCreateWorkOrder, useUpdateWorkOrder } from "../hooks/use-work-orders"
import { useInstruments } from "@/features/instruments/hooks/use-instruments"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface WorkOrderFormProps {
    initialData?: WorkOrderFormData & { id?: number }
    onSuccess: () => void
}

export function WorkOrderForm({ initialData, onSuccess }: WorkOrderFormProps) {
    const tCommon = useTranslations('Common')
    const create = useCreateWorkOrder()
    const update = useUpdateWorkOrder()

    // Assuming we mostly check-in instruments for now. 
    // For a real LIMS, we'd need a unified searchable dropdown for both Instruments and Standards.
    const { data: instrumentsQuery } = useInstruments({ per_page: 500 }) 
    const instruments = instrumentsQuery?.data || []

    const form = useForm<WorkOrderFormData>({
        resolver: zodResolver(workOrderFormDataSchema),
        defaultValues: initialData || {
            item_id: 0,
            item_type: 'Modules\\Metrology\\Models\\Instrument',
            visual_inspection_notes: "",
            customer_notes: "",
            expected_return_date: "",
            status: "received",
        },
    })

    const onSubmit = async (data: WorkOrderFormData) => {
        try {
            if (initialData?.id) {
                await update.mutateAsync({ id: initialData.id.toString(), data })
                toast.success(tCommon('updated_success') || "Updated successfully")
            } else {
                await create.mutateAsync(data)
                toast.success(tCommon('created_success') || "Created successfully")
            }
            onSuccess()
        } catch (error) {
            toast.error(tCommon('error') || "An error occurred")
        }
    }

    const isLoading = create.isPending || update.isPending

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="item_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instrument / Asset</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value ? field.value.toString() : ""}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an instrument" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {instruments.map((inst: any) => (
                                        <SelectItem key={inst.id} value={inst.id.toString()}>
                                            {inst.name} ({inst.serial_number})
                                        </SelectItem>
                                    ))}
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
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="received">Received (Check-in)</SelectItem>
                                    <SelectItem value="in_queue">In Queue (Awaiting Calib)</SelectItem>
                                    <SelectItem value="calibrating">Calibrating</SelectItem>
                                    <SelectItem value="finished">Finished</SelectItem>
                                    <SelectItem value="dispatched">Dispatched (Returned)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="expected_return_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expected Return Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="visual_inspection_notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visual Inspection Notes</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="e.g. Arrived with scratched display, missing case." 
                                    className="resize-none" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormDescription>
                                Document the physical state of the item upon receiving.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : tCommon('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
