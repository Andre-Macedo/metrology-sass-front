"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    permissions: z.array(z.string()).min(1, "Select at least one permission"),
})

interface RoleFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const ALL_PERMISSIONS = [
    { id: 'instruments.view', label: 'View Instruments' },
    { id: 'instruments.create', label: 'Create Instruments' },
    { id: 'instruments.edit', label: 'Edit Instruments' },
    { id: 'instruments.delete', label: 'Delete Instruments' },
    { id: 'calibrations.view', label: 'View Calibrations' },
    { id: 'calibrations.create', label: 'Create Calibrations' },
    { id: 'calibrations.approve', label: 'Approve Calibrations' },
    { id: 'users.manage', label: 'Manage Users' },
    { id: 'system.settings', label: 'System Settings' },
]

export function RoleFormDialog({ open, onOpenChange }: RoleFormDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            permissions: [],
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log(values)
            toast.success("Role created successfully")
            onOpenChange(false)
            form.reset()
        } catch (error) {
            console.error(error)
            toast.error("Failed to create role")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Role</DialogTitle>
                    <DialogDescription>
                        Define a new role and assign permissions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Quality Manager" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="permissions"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Permissions</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto border p-2 rounded-md">
                                        {ALL_PERMISSIONS.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal text-xs">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>Save Role</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
