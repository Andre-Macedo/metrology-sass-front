"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Material, materialSchema } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"
import { useCreateMaterial, useUpdateMaterial } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-materials"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Props {
    initialData?: Material | null
    onSuccess: () => void
}

export function MaterialForm({ initialData, onSuccess }: Props) {
    const t = useTranslations('Settings.materials')
    const commonT = useTranslations('Common')
    
    const create = useCreateMaterial()
    const update = useUpdateMaterial()

    const form = useForm<Material>({
        resolver: zodResolver(materialSchema),
        defaultValues: initialData || {
            name: "",
            cte: 0,
            category: "Metal"
        }
    })

    const onSubmit = async (data: Material) => {
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
                <div className="grid grid-cols-2 gap-4">
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
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('category')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('category_placeholder')} {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="cte"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('cte')}</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.000001" placeholder="Ex: 11.5" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription className="text-[10px]">
                                {t('cte_description')}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={create.isPending || update.isPending}>
                        {create.isPending || update.isPending ? commonT('saving') : commonT('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
