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
import { Calibration, calibrationSchema } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/lib/schema"

// Simple schema for basic editing without the full wizard complexity
const formSchema = calibrationSchema.omit({ id: true })

interface CalibrationFormProps {
    initialData?: Calibration
    onSubmit: (values: z.infer<typeof formSchema>) => void
    isLoading?: boolean
}

/**
 * Form for editing basic Calibration details.
 * For creating new calibrations with measurements, use `CalibrationWizard`.
 */
export function CalibrationForm({ initialData, onSubmit, isLoading }: CalibrationFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            instrument_id: initialData.instrument_id,
            instrument_name: initialData.instrument_name,
            date: initialData.date,
            technician: initialData.technician,
            result: initialData.result,
            next_due_date: initialData.next_due_date,
            notes: initialData.notes,
        } : {
            instrument_id: "",
            instrument_name: "",
            date: new Date().toISOString().split('T')[0],
            technician: "",
            result: "pass",
            next_due_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="instrument_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instrument Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Digital Caliper" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="instrument_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asset ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="INS-123" {...field} value={field.value || ''} />
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
                                <FormLabel>Calibration Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value || ''} />
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
                                <FormLabel>Technician</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="result"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Result</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select result" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="pass">Pass</SelectItem>
                                        <SelectItem value="fail">Fail</SelectItem>
                                        <SelectItem value="conditional_pass">Conditional Pass</SelectItem>
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
                                <FormLabel>Next Due Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Calibration"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
