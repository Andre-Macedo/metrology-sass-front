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
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
import { toast } from "sonner"
import { User } from "../types"
import { useCompetences, useSyncCompetences } from "../hooks/use-system"
import { useInstrumentTypes } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/hooks/use-types"
import { Loader2 } from "lucide-react"

export function UserCompetencesDialog({ open, onOpenChange, user }: { open: boolean, onOpenChange: (open: boolean) => void, user?: User | null }) {
    const { data: competences, isLoading: loadingCompetences } = useCompetences(user?.id || null)
    const { data: instrumentTypes = [], isLoading: loadingTypes } = useInstrumentTypes()
    const syncMutation = useSyncCompetences()

    const formSchema = z.object({
        competences: z.array(z.object({
            instrument_type_id: z.number(),
            instrument_type_name: z.string(),
            selected: z.boolean(),
            valid_until: z.string().nullable().optional()
        }))
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            competences: []
        },
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "competences",
    })

    useEffect(() => {
        if (open && instrumentTypes.length > 0) {
            const mapped = instrumentTypes.map(type => {
                const existing = competences?.find((c: any) => c.instrument_type_id === type.id)
                return {
                    instrument_type_id: type.id!,
                    instrument_type_name: type.name,
                    selected: !!existing,
                    valid_until: existing?.valid_until ? existing.valid_until.split('T')[0] : null
                }
            })
            form.reset({ competences: mapped })
        }
    }, [open, instrumentTypes, competences, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return

        try {
            const selectedCompetences = values.competences
                .filter(c => c.selected)
                .map(c => ({
                    instrument_type_id: c.instrument_type_id,
                    valid_until: c.valid_until || null
                }))

            await syncMutation.mutateAsync({ userId: user.id, competences: selectedCompetences })
            toast.success("Competence matrix updated successfully")
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update competences")
        }
    }

    const isLoading = loadingCompetences || loadingTypes

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Training & Competence Matrix</DialogTitle>
                    <DialogDescription>
                        Manage which instrument types {user?.name} is authorized to calibrate.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left w-12"></th>
                                            <th className="p-3 text-left">Instrument Type</th>
                                            <th className="p-3 text-left w-48">Valid Until</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => (
                                            <tr key={field.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="p-3 text-center">
                                                    <FormField
                                                        control={form.control}
                                                        name={`competences.${index}.selected`}
                                                        render={({ field }) => (
                                                            <FormControl>
                                                                <Checkbox 
                                                                    checked={field.value} 
                                                                    onCheckedChange={field.onChange} 
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {field.instrument_type_name}
                                                </td>
                                                <td className="p-3">
                                                    <FormField
                                                        control={form.control}
                                                        name={`competences.${index}.valid_until`}
                                                        render={({ field: inputField }) => (
                                                            <FormControl>
                                                                <Input 
                                                                    type="date" 
                                                                    className="h-8 text-xs" 
                                                                    disabled={!form.watch(`competences.${index}.selected`)}
                                                                    {...inputField}
                                                                    value={inputField.value || ''}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={syncMutation.isPending}>
                                    {syncMutation.isPending ? "Saving..." : "Save Matrix"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
