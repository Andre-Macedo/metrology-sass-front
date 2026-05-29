"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { ReferenceStandard, standardSchema } from "../lib/schema"
import { useMaterials } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-materials"
import { useTranslations } from "next-intl"

interface StandardFormProps {
    initialData?: ReferenceStandard
    onSubmit: (values: any) => void
    isLoading?: boolean
}

export function StandardForm({ initialData, onSubmit, isLoading }: StandardFormProps) {
    const t = useTranslations('Standards.form')
    const tV = useTranslations('Validations')
    const tTypes = useTranslations('Standards.types')
    const { data: materials } = useMaterials()

    const formSchema = z.object({
        name: z.string().min(1, tV('required')),
        serial_number: z.string().min(1, tV('required')),
        type: z.enum(["gauge_block", "caliper_checker", "micrometer_standard", "other"]),
        nominal_value: z.string().optional(),
        material_id: z.number().optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            serial_number: "",
            type: "gauge_block",
            nominal_value: "",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    <FormField
                        control={form.control}
                        name="serial_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('serial_number')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('serial_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('type')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('type_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="gauge_block">{tTypes('gauge_block')}</SelectItem>
                                        <SelectItem value="caliper_checker">{tTypes('caliper_checker')}</SelectItem>
                                        <SelectItem value="micrometer_standard">{tTypes('micrometer_standard')}</SelectItem>
                                        <SelectItem value="other">{tTypes('other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {/* Material Selection */}
                    <FormField
                        control={form.control}
                        name="material_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('material')}</FormLabel>
                                <Select 
                                    onValueChange={(val) => field.onChange(Number(val))} 
                                    defaultValue={field.value?.toString()}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('material_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {materials?.map((material) => (
                                            <SelectItem key={material.id} value={material.id.toString()}>
                                                {material.name} (CTE: {material.cte})
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
                        name="nominal_value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('nominal_value')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('nominal_placeholder')} {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? t('saving') : t('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
