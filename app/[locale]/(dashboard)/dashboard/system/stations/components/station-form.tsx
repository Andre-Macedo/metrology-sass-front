"use client"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Station, StationFormData } from "@/lib/hooks/use-system"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    location: z.string().optional(),
    hostname: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    status: z.string().min(1, "Status is required"),
})

interface StationFormProps {
    initialData?: Station | null
    onSubmit: (data: StationFormData) => Promise<void>
    isLoading?: boolean
}

export function StationForm({ initialData, onSubmit, isLoading }: StationFormProps) {
    const router = useRouter()

    const form = useForm<StationFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            location: initialData?.location || "",
            hostname: initialData?.hostname || "",
            type: initialData?.type || "Workstation",
            status: initialData?.status || "Active",
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Station Name</FormLabel>
                                    <FormControl><Input placeholder="Bench 01" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hostname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hostname (Machine Name)</FormLabel>
                                    <FormControl><Input placeholder="PC-LAB-01" {...field} /></FormControl>
                                    <FormDescription>Used for automatic log detection.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location / Sector</FormLabel>
                                    <FormControl><Input placeholder="Sector A" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Workstation">Workstation</SelectItem>
                                            <SelectItem value="Laboratory">Laboratory</SelectItem>
                                            <SelectItem value="Production">Production</SelectItem>
                                            <SelectItem value="Mobile">Mobile</SelectItem>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>Save Station</Button>
                </div>
            </form>
        </Form>
    )
}
