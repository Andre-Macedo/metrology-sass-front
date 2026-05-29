"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InstrumentType, instrumentTypeSchema } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { useCreateInstrumentType, useUpdateInstrumentType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"

interface Props {
    initialData?: InstrumentType | null
    onSuccess: () => void
}

export function InstrumentTypeForm({ initialData, onSuccess }: Props) {
    const t = useTranslations('Instruments.form')
    const commonT = useTranslations('Common')
    
    const create = useCreateInstrumentType()
    const update = useUpdateInstrumentType()

    const form = useForm<InstrumentType>({
        resolver: zodResolver(instrumentTypeSchema),
        defaultValues: initialData || {
            name: "",
            calibration_frequency_months: 12,
            decision_rule: "simple"
        }
    })

    const onSubmit = async (data: InstrumentType) => {
        try {
            if (initialData?.id) {
                await update.mutateAsync({ id: initialData.id, data })
                toast.success(commonT('save_success') || "Updated successfully")
            } else {
                await create.mutateAsync(data)
                toast.success(commonT('save_success') || "Created successfully")
            }
            onSuccess()
        } catch (error) {
            toast.error(commonT('error') || "An error occurred")
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
                            <FormLabel>{t('name')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('name_placeholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="calibration_frequency_months"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('next_calibration')}</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription className="text-[10px]">
                                    {t('next_calibration_description')}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="decision_rule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('decision_rule')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('decision_rule_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="simple">{t('rules.simple')}</SelectItem>
                                        <SelectItem value="guard_band">{t('rules.guard_band')}</SelectItem>
                                        <SelectItem value="uncertainty_accounted">{t('rules.uncertainty_accounted')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-[10px]">
                                    {t('decision_rule_description')}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={create.isPending || update.isPending}>
                        {create.isPending || update.isPending ? t('saving') : commonT('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
