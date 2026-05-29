"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReferenceStandardType, referenceStandardTypeSchema } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { useCreateReferenceStandardType, useUpdateReferenceStandardType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

interface Props {
    initialData?: ReferenceStandardType | null
    onSuccess: () => void
}

export function StandardTypeForm({ initialData, onSuccess }: Props) {
    const create = useCreateReferenceStandardType()
    const update = useUpdateReferenceStandardType()

    const form = useForm<ReferenceStandardType>({
        resolver: zodResolver(referenceStandardTypeSchema),
        defaultValues: initialData || {
            name: "",
            calibration_frequency_months: 24, // Standard default
            description: ""
        }
    })

    const onSubmit = async (data: ReferenceStandardType) => {
        try {
            if (initialData?.id) {
                await update.mutateAsync({ id: initialData.id, data })
                toast.success("Updated successfully")
            } else {
                await create.mutateAsync(data)
                toast.success("Created successfully")
            }
            onSuccess()
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="calibration_frequency_months"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Frequency (Months)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={create.isPending || update.isPending}>
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    )
}
