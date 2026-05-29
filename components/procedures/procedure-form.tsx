"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistTemplate } from "@/lib/api/procedures"
import { Plus, Trash, ArrowUp, ArrowDown } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(2, "Procedure name is required"),
    items: z.array(z.object({
        step: z.string().min(1, "Step description is required"),
        question_type: z.enum(['numeric', 'boolean', 'text']),
        nominal_value: z.coerce.number().optional(),
        required_readings: z.coerce.number().optional(),
        criteria: z.coerce.number().optional()
    })).min(1, "At least one checkpoint is required")
})

interface ProcedureFormProps {
    initialData?: ChecklistTemplate
    onSubmit: (values: z.infer<typeof formSchema>) => void
    isLoading?: boolean
}

export function ProcedureForm({ initialData, onSubmit, isLoading }: ProcedureFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            items: [{ step: "Visual Check", question_type: 'boolean' }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Helper to watch field types for conditional rendering
    const watchedItems = form.watch("items");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Master Data */}
                <Card>
                    <CardHeader>
                        <CardTitle>Procedure Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Procedure Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Caliper 0-150mm (DIN 862)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Details Repeater */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Checkpoints</h3>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => append({ step: "", question_type: 'numeric', nominal_value: 0, required_readings: 3, criteria: 0.01 })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Numeric
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => append({ step: "", question_type: 'boolean' })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add Boolean
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
                                                    <FormLabel className="text-xs text-muted-foreground">Description</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={currentType === 'boolean' ? "e.g. Cleanliness Check" : "e.g. 50.00 mm"} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Type Selector (Hidden or Read-only visual potentially, but let's make it editable) */}
                                    <div className="md:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.question_type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="numeric">Numeric</SelectItem>
                                                            <SelectItem value="boolean">Pass/Fail</SelectItem>
                                                            <SelectItem value="text">Text Obs.</SelectItem>
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
                                                            <FormLabel className="text-xs text-muted-foreground">Target</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.001" {...field} />
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
                                                            <FormLabel className="text-xs text-muted-foreground">Tol (+/-)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.001" {...field} />
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
                                                            <FormLabel className="text-xs text-muted-foreground">Qty</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min="1" {...field} />
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
                                                {currentType === 'boolean' ? 'Technician will select Pass/Fail.' : 'Technician will enter text notes.'}
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
                        {isLoading ? "Saving..." : "Save Procedure"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
