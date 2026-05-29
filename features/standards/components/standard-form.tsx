"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ReferenceStandard } from "../types"
import { useMaterials } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-materials"
import { useStandards } from "../hooks/use-standards"
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
    // Fetch potential parent kits (fetch up to 100 for the dropdown)
    const { data: standardsData } = useStandards({ per_page: 100 })
    const allStandards = standardsData?.data || []
    
    // Filter out the current standard so it can't be its own parent
    const potentialParents = allStandards.filter(s => s.id !== initialData?.id)

    const formSchema = z.object({
        name: z.string().min(1, tV('required')),
        serial_number: z.string().optional(), // Can be optional if it's a child in a kit
        stock_number: z.string().optional(),
        type: z.enum(["gauge_block", "caliper_checker", "micrometer_standard", "other"]),
        nominal_value: z.string().optional(),
        actual_value: z.string().optional(),
        unit: z.string().optional(),
        material_id: z.number().optional().nullable(),
        parent_id: z.coerce.string().optional().nullable(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            serial_number: initialData.serial_number !== 'N/A' ? initialData.serial_number : "",
            stock_number: initialData.stock_number || "",
            type: initialData.type as any || "other",
            nominal_value: initialData.nominal_value || "",
            actual_value: initialData.actual_value || "",
            unit: initialData.unit || "",
            material_id: initialData.material_id || undefined,
            parent_id: initialData.parent_id?.toString() || undefined,
        } : {
            name: "",
            serial_number: "",
            stock_number: "",
            type: "gauge_block",
            nominal_value: "",
            actual_value: "",
            unit: "",
            material_id: undefined,
            parent_id: undefined,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Basic Info */}
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
                        name="parent_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('parent_kit')}</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value || undefined}
                                    value={field.value || undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('parent_kit_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">-- {t('no_parent')} --</SelectItem>
                                        {potentialParents.map((parent) => (
                                            <SelectItem key={parent.id} value={parent.id.toString()}>
                                                {parent.name} ({parent.serial_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription className="text-[10px]">
                                    {t('parent_kit_desc')}
                                </FormDescription>
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
                        name="stock_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('stock_number')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('stock_placeholder')} {...field} />
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
                                        <SelectItem value="none">-- {t('no_parent')} --</SelectItem>
                                        {materials?.map((material) => (
                                            <SelectItem key={material.id} value={material.id!.toString()}>
                                                {material.name} (CTE: {material.cte})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Metrology Values */}
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
                    <FormField
                        control={form.control}
                        name="actual_value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('actual_value')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('actual_placeholder')} {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('unit')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('unit_placeholder')} {...field} value={field.value || ''} />
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
