"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { toast } from "sonner"
import { ClipboardCheck } from "lucide-react"
import { intermediateCheckFormSchema } from "../lib/schema"
import { useCreateIntermediateCheck } from "../hooks/use-intermediate-checks"
import { useStandards } from "@/app/[locale]/(dashboard)/dashboard/metrology/standards/hooks/use-standards"

interface CheckFormDialogProps {
    instrumentId: number
}

export function CheckFormDialog({ instrumentId }: CheckFormDialogProps) {
    const [open, setOpen] = useState(false)
    const createMutation = useCreateIntermediateCheck()

    // Fetch standards for selection
    const { data: standardsData } = useStandards({ page: 1, per_page: 100 }) // Fetch enough standards
    const standards = standardsData?.data || []

    const form = useForm<z.infer<typeof intermediateCheckFormSchema>>({
        resolver: zodResolver(intermediateCheckFormSchema),
        defaultValues: {
            instrument_id: instrumentId,
            check_date: new Date().toISOString().split('T')[0],
            result: 'passed',
            reference_standard_id: undefined,
            temperature: undefined,
            humidity: undefined,
            notes: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof intermediateCheckFormSchema>) => {
        try {
            await createMutation.mutateAsync(values)
            toast.success("Intermediate Check recorded successfully")
            setOpen(false)
            form.reset({
                ...values,
                check_date: new Date().toISOString().split('T')[0],
                notes: ""
            })
        } catch (error) {
            toast.error("Failed to record check")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Register Check
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Register Intermediate Check</DialogTitle>
                    <DialogDescription>
                        Record a simplified verification. Failed checks may restrict the instrument.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="check_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
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
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="passed" className="text-green-600 font-medium">PASS</SelectItem>
                                                <SelectItem value="failed" className="text-red-600 font-medium">FAIL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reference_standard_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reference Standard Used</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val ? parseInt(val) : 0)}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select standard..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {standards.map(std => (
                                                <SelectItem key={std.id} value={std.id.toString()}>
                                                    {std.name} ({std.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Temp (°C)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="20.0" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="humidity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Humidity (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1" placeholder="50" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Observations about the verification..." {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Saving..." : "Save Record"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
