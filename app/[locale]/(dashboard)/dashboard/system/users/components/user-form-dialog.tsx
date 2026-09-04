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
import { User, useUserMutations, useRoles } from "@/features/system/hooks/use-system"
import { useEffect } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function UserFormDialog({ open, onOpenChange, user }: { open: boolean, onOpenChange: (open: boolean) => void, user?: User | null }) {
    const t = useTranslations('Users.form')
    const tRoles = useTranslations('Users.roles')
    const tV = useTranslations('Validations')
    const tMessages = useTranslations('Users.messages')
    
    const { createUser, updateUser } = useUserMutations()
    const { data: roles } = useRoles()

    const formSchema = z.object({
        name: z.string().min(2, tV('min_characters', { count: 2 })),
        email: z.string().email(tV('invalid_email')),
        password: z.string().optional(),
        role: z.string().min(1, tV('required')),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "Operator",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: "", // Don't fill password
                role: user.roles && user.roles.length > 0 ? user.roles[0].name : "Operator",
            })
        } else {
            form.reset({
                name: "",
                email: "",
                password: "",
                role: "Operator",
            })
        }
    }, [user, form, open])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Validate password for new users
            if (!user && !values.password) {
                form.setError("password", { message: t('password_required') })
                return
            }

            if (user) {
                await updateUser.mutateAsync({ id: user.id, data: values })
                toast.success(tMessages('updated_success'))
            } else {
                await createUser.mutateAsync(values)
                toast.success(tMessages('created_success'))
            }
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error(tMessages('save_error'))
        }
    }

    const isLoading = createUser.isPending || updateUser.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? t('details') : t('create_description')}</DialogTitle>
                    <DialogDescription>
                        {user ? t('update_description') : t('create_description')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('email')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder={t('email_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('role')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('role_placeholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Static options fallback if roles api not ready */}
                                            <SelectItem value="Admin">{tRoles('Admin')}</SelectItem>
                                            <SelectItem value="Manager">{tRoles('Manager')}</SelectItem>
                                            <SelectItem value="Metrologist">{tRoles('Metrologist')}</SelectItem>
                                            <SelectItem value="Operator">{tRoles('Operator')}</SelectItem>

                                            {/* Dynamic options if available */}
                                            {roles && roles.map((r) => {
                                                const roleVal = typeof r === 'string' ? r : (r as any).name;
                                                // Avoid duplicates if static list already contains it
                                                if (['Admin', 'Manager', 'Metrologist', 'Operator'].includes(roleVal)) return null;
                                                return (
                                                    <SelectItem key={roleVal} value={roleVal}>
                                                        {roleVal}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('password')} {user && t('password_helper')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('password_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>{t('save_changes')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
