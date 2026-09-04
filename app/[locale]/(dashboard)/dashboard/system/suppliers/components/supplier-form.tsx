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
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Supplier, SupplierFormData } from "@/features/system/hooks/use-system"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    contact_person: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    category: z.string().min(1, "Category is required"),
    rating: z.coerce.number().min(0).max(5).optional(),
    country: z.string().optional(),
    cnpj: z.string().optional(),
    address: z.string().optional(),
    is_manufacturer: z.boolean().default(false),
    is_calibration_provider: z.boolean().default(false),
    is_maintenance_provider: z.boolean().default(false),
})

interface SupplierFormProps {
    initialData?: Supplier | null
    onSubmit: (data: SupplierFormData) => Promise<void>
    isLoading?: boolean
}

export function SupplierForm({ initialData, onSubmit, isLoading }: SupplierFormProps) {
    const router = useRouter()

    const form = useForm<SupplierFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            contact_person: initialData?.contact_person || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            status: initialData?.status || "Active",
            category: initialData?.category || "General",
            rating: initialData?.rating || 0,
            country: initialData?.country || "",
            cnpj: initialData?.cnpj || "",
            address: initialData?.address || "",
            is_manufacturer: initialData?.is_manufacturer || false,
            is_calibration_provider: initialData?.is_calibration_provider || false,
            is_maintenance_provider: initialData?.is_maintenance_provider || false,
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
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_person"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Person</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
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
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Metrology">Metrology</SelectItem>
                                            <SelectItem value="IT">IT</SelectItem>
                                            <SelectItem value="Facilities">Facilities</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_calibration_provider"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Calibration Provider
                                        </FormLabel>
                                        <FormDescription>
                                            This supplier performs calibration services.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>Save Supplier</Button>
                </div>
            </form>
        </Form>
    )
}
