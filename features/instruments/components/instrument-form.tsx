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
import { Instrument } from "../types"
import { useInstrumentTypes } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { useMaterials } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-materials"
import { useStations } from "@/features/system/hooks/use-system"
import { useEffect } from "react"
import { addMonths } from "date-fns"
import { useTranslations } from "next-intl"

interface InstrumentFormProps {
    initialData?: Instrument
    onSubmit: (values: any) => void
    isLoading?: boolean
}

export function InstrumentForm({ initialData, onSubmit, isLoading }: InstrumentFormProps) {
    const t = useTranslations('Instruments.form')
    const tV = useTranslations('Validations')
    const tStatus = useTranslations('Instruments.status')
    
    const { data: instrumentTypes = [] } = useInstrumentTypes()
    const { data: materials } = useMaterials()
    const { data: stationsResponse } = useStations(1, '', 100) // Pega as localizações
    const stations = (stationsResponse as any)?.data || []

    const formSchema = z.object({
        name: z.string().min(2, {
            message: tV('min_characters', { count: 2 }),
        }),
        instrument_type_id: z.string().min(1, tV('select_option')),
        material_id: z.string().optional(),
        serial_number: z.string().min(1, {
            message: tV('required')
        }),
        manufacturer: z.string().min(1, {
            message: tV('required')
        }),
        model: z.string().min(1, {
            message: tV('required')
        }),
        status: z.enum(['active', 'expired', 'in_calibration', 'rejected', 'inactive', 'due', 'calibrating', 'lost', 'maintenance', 'scrapped']),
        current_station_id: z.string().optional(),
        last_calibration_date: z.string(),
        next_calibration_date: z.string(),
        guard_band_multiplier_override: z.coerce.number().optional(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            instrument_type_id: initialData.instrument_type_id || "",
            current_station_id: initialData.current_station_id || "",
            material_id: initialData.material_id || undefined,
            guard_band_multiplier_override: initialData.guard_band_multiplier_override || undefined,
        } : {
            name: "",
            instrument_type_id: "",
            material_id: undefined,
            serial_number: "",
            manufacturer: "",
            model: "",
            status: "active",
            current_station_id: "",
            last_calibration_date: new Date().toISOString().split('T')[0],
            next_calibration_date: new Date().toISOString().split('T')[0],
        },
    })

    // Watch for type changes to auto-calc next date
    const typeId = form.watch('instrument_type_id')
    const lastDate = form.watch('last_calibration_date')

    useEffect(() => {
        if (typeId && lastDate && instrumentTypes.length > 0) {
            const type = instrumentTypes.find(t => t.id === typeId)
            if (type && type.calibration_frequency_months) {
                const next = addMonths(new Date(lastDate), type.calibration_frequency_months)
                form.setValue('next_calibration_date', next.toISOString().split('T')[0])
            }
        }
    }, [typeId, lastDate, instrumentTypes, form])

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
                        name="instrument_type_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('type')}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('type_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {instrumentTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name} ({type.calibration_frequency_months}m)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {t('type_description')}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="material_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Material (Correção Térmica)</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o material (opcional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {materials?.map((material) => (
                                            <SelectItem key={material.id} value={material.id}>
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('status')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('status_placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">{tStatus('active')}</SelectItem>
                                        <SelectItem value="inactive">{tStatus('inactive')}</SelectItem>
                                        <SelectItem value="in_calibration">{tStatus('in_calibration')}</SelectItem>
                                        <SelectItem value="due">{tStatus('due_soon')}</SelectItem>
                                        <SelectItem value="expired">{tStatus('expired')}</SelectItem>
                                        <SelectItem value="rejected">{tStatus('rejected')}</SelectItem>
                                        <SelectItem value="maintenance">{tStatus('maintenance') || 'Em Manutenção'}</SelectItem>
                                        <SelectItem value="lost">{tStatus('lost')}</SelectItem>
                                        <SelectItem value="scrapped">{tStatus('scrapped') || 'Sucata'}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="current_station_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Localização Industrial</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a planta/setor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {stations.map((station: any) => (
                                            <SelectItem key={station.id} value={station.id}>
                                                {station.full_path || station.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Onde este instrumento está alocado fisicamente.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="guard_band_multiplier_override"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Multiplicador Banda de Guarda (w)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.1" 
                                        placeholder="Padrão do Tipo" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormDescription>
                                    Override específico para este instrumento.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="last_calibration_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('last_calibration')}</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="next_calibration_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('next_calibration')}</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
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
