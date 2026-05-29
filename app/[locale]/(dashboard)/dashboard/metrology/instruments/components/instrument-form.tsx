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
import { Instrument } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/lib/schema"
import { useMaterials } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-materials"

// Form schema can be slightly different from Domain schema (e.g. no ID)
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    serial_number: z.string().min(1, { message: "Serial number is required." }),
    manufacturer: z.string().min(1, { message: "Manufacturer is required." }),
    model: z.string().min(1, { message: "Model is required." }),
    status: z.enum(['active', 'expired', 'in_calibration', 'rejected', 'inactive', 'due']),
    location: z.string().optional(),
    last_calibration_date: z.string().optional(),
    next_calibration_date: z.string().optional(),
    material_id: z.coerce.number().optional(), // Coerce to handle string inputs from Select
})

interface InstrumentFormProps {
    initialData?: Instrument
    onSubmit: (values: z.infer<typeof formSchema>) => void
    isLoading?: boolean
}

export function InstrumentForm({ initialData, onSubmit, isLoading }: InstrumentFormProps) {
    const { data: materials } = useMaterials()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            location: initialData.location || '',
            last_calibration_date: initialData.last_calibration_date || '',
            next_calibration_date: initialData.next_calibration_date || '',
            material_id: initialData.material_id || undefined,
        } : {
            name: "",
            serial_number: "",
            manufacturer: "",
            model: "",
            status: "active",
            location: "",
            last_calibration_date: new Date().toISOString().split('T')[0],
            next_calibration_date: new Date().toISOString().split('T')[0],
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
                                <FormLabel>Instrument Name</FormLabel>
                                <FormControl><Input placeholder="Digital Caliper" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="serial_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Serial Number</FormLabel>
                                <FormControl><Input placeholder="SN-123456" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="manufacturer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Manufacturer</FormLabel>
                                <FormControl><Input placeholder="Mitutoyo" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl><Input placeholder="CD-6 AX" {...field} /></FormControl>
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
                                <FormLabel>Material (Thermal Correction)</FormLabel>
                                <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value?.toString()}
                                    value={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select material..." />
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
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="in_calibration">In Calibration</SelectItem>
                                        <SelectItem value="due">Due Soon</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl><Input placeholder="Lab A" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_calibration_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Calibration</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="next_calibration_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Next Calibration</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Instrument"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
