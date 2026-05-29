"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistTemplate, checklistTemplateSchema } from "@/app/[locale]/(dashboard)/dashboard/metrology/procedures/lib/schema"
import { Plus, Trash } from "lucide-react"
import { useInstrumentTypes } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { useTranslations } from "next-intl"

interface ProcedureFormProps {
    initialData?: ChecklistTemplate
    onSubmit: (values: any) => void
    isLoading?: boolean
}

export function ProcedureForm({ initialData, onSubmit, isLoading }: ProcedureFormProps) {
    const t = useTranslations('Procedures.form')
    const tV = useTranslations('Validations')
    const tTypes = useTranslations('Procedures.types')
    const { data: instrumentTypes = [] } = useInstrumentTypes()

    const formSchema = z.object({
        name: z.string().min(1, tV('required')),
        instrument_type_id: z.coerce.number().min(1, tV('select_option')),
        items: z.array(z.object({
            step: z.string().min(1, tV('required')),
            question_type: z.enum(['numeric', 'boolean', 'text']),
            nominal_value: z.number().optional(),
            required_readings: z.number().optional(),
            criteria: z.number().optional(),
            order: z.number().optional(),
        })).min(1),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            instrument_type_id: initialData.instrument_type_id,
            items: initialData.items.map(i => ({
                ...i,
                nominal_value: i.nominal_value || 0,
                required_readings: i.required_readings || 1,
                criteria: i.criteria || 0,
                order: i.order || 0
            }))
        } : {
            name: "",
            instrument_type_id: 0,
            items: [{ step: "", question_type: 'boolean', nominal_value: 0, required_readings: 1, criteria: 0, order: 1 }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchedItems = form.watch("items");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Master Data */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('details_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                            name="instrument_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('instrument_type')}</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(parseInt(val))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('instrument_type_placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {instrumentTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id?.toString() || ""}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        {t('instrument_type_description')}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Details Repeater */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{t('checkpoints_title')}</h3>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => append({ step: "", question_type: 'numeric', nominal_value: 0, required_readings: 3, criteria: 0.01, order: fields.length + 1 })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> {t('add_numeric')}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => append({ step: "", question_type: 'boolean', nominal_value: 0, required_readings: 1, criteria: 0, order: fields.length + 1 })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> {t('add_boolean')}
                            </Button>
                        </div>
                    </div>

                    {fields.map((field, index) => {
                        const currentType = watchedItems[index]?.question_type || 'numeric';

                        return (
                            <Card key={field.id} className="relative transition-all hover:border-primary/50">
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                    {/* Step Name */}
                                    <div className="md:col-span-5">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.step`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">{t('step_description')}</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder={currentType === 'boolean' ? t('step_description_boolean_placeholder') : t('step_description_numeric_placeholder')} 
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Type Selector */}
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.question_type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">{t('step_type')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="numeric">{tTypes('numeric')}</SelectItem>
                                                            <SelectItem value="boolean">{tTypes('boolean')}</SelectItem>
                                                            <SelectItem value="text">{tTypes('text')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Conditional Fields */}
                                    {currentType === 'numeric' && (
                                        <>
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.nominal_value`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">{t('step_target')}</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.criteria`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">{t('step_tolerance')}</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.required_readings`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground">{t('step_qty')}</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {(currentType === 'boolean' || currentType === 'text') && (
                                        <div className="md:col-span-5 flex items-center h-full pt-6">
                                            <span className="text-xs text-muted-foreground italic">
                                                {currentType === 'boolean' ? t('boolean_helper') : t('text_helper')}
                                            </span>
                                        </div>
                                    )}

                                </CardContent>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                    onClick={() => remove(index)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </Card>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading ? t('saving') : t('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
