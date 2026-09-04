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
import { Calibration } from "../types"
import { useTranslations } from "next-intl"

interface CalibrationFormProps {
    initialData?: Calibration
    onSubmit: (values: any) => void
    isLoading?: boolean
}

export function CalibrationForm({ initialData, onSubmit, isLoading }: CalibrationFormProps) {
    const t = useTranslations('Calibrations.form')
    const tV = useTranslations('Validations')
    const tResult = useTranslations('Calibrations.result')

    const formSchema = z.object({
        instrument_id: z.string().min(1, tV('required')),
        instrument_name: z.string().min(1, tV('required')),
        date: z.string(),
        technician: z.string().min(1, tV('required')),
        result: z.enum(['pass', 'fail', 'conditional_pass']),
        as_found_result: z.string().optional(),
        as_left_result: z.string().optional(),
        as_found_deviation: z.coerce.number().optional(),
        as_left_deviation: z.coerce.number().optional(),
        next_due_date: z.string(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            instrument_id: "",
            instrument_name: "",
            date: new Date().toISOString().split('T')[0],
            technician: "",
            result: "pass",
            as_found_result: "",
            as_left_result: "",
            as_found_deviation: undefined,
            as_left_deviation: undefined,
            next_due_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="instrument_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('instrument_id')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('instrument_id_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="instrument_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('instrument_name')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('instrument_name_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('date')}</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="technician"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('technician')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('technician_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* As Found Section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md bg-muted/20 mt-4">
                        <h3 className="md:col-span-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">As Found (Recebimento)</h3>
                        <FormField
                            control={form.control}
                            name="as_found_deviation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Desvio Encontrado</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="Ex: 0.05" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="as_found_result"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resultado Encontrado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o estado inicial" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pass">{tResult('pass')}</SelectItem>
                                            <SelectItem value="fail">{tResult('fail')}</SelectItem>
                                            <SelectItem value="conditional_pass">{tResult('conditional_pass')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* As Left Section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md bg-muted/20">
                        <h3 className="md:col-span-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">As Left (Após Ajuste)</h3>
                        <FormField
                            control={form.control}
                            name="as_left_deviation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Desvio Final</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="Ex: 0.01" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="as_left_result"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resultado Final (Ajustado)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o estado após ajuste" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pass">{tResult('pass')}</SelectItem>
                                            <SelectItem value="fail">{tResult('fail')}</SelectItem>
                                            <SelectItem value="conditional_pass">{tResult('conditional_pass')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="result"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('result')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('result_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pass">{tResult('pass')}</SelectItem>
                                        <SelectItem value="fail">{tResult('fail')}</SelectItem>
                                        <SelectItem value="conditional_pass">{tResult('conditional_pass')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="next_due_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('next_due_date')}</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
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
