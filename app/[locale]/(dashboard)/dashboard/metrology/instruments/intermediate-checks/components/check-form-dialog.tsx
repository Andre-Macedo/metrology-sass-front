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
import { ClipboardCheck, AlertTriangle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { intermediateCheckFormSchema } from "../lib/schema"
import { useCreateIntermediateCheck } from "../hooks/use-intermediate-checks"
import { useStandards } from "@/features/standards"

interface CheckFormDialogProps {
    instrumentId: string | number
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
            nominal_value: undefined,
            measured_value: undefined,
            deviation: undefined,
            temperature: undefined,
            humidity: undefined,
            notes: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof intermediateCheckFormSchema>) => {
        try {
            await createMutation.mutateAsync(values)
            if (values.result === 'failed') {
                toast.warning("Instrumento bloqueado por reprovação na checagem intermediária (ISO/IEC 17025 §6.4.10). Não conformidade aberta.")
            } else {
                toast.success("Checagem intermediária registrada com sucesso.")
            }
            setOpen(false)
            form.reset({
                ...values,
                check_date: new Date().toISOString().split('T')[0],
                notes: ""
            })
        } catch (error) {
            toast.error("Falha ao registrar checagem intermediária")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Registrar Checagem
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Checagem Intermediária</DialogTitle>
                    <DialogDescription>
                        Registro de verificação metrológica periódica. Falhas bloqueiam o instrumento imediatamente conforme ISO/IEC 17025 §6.4.10.
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
                                        <FormLabel>Data</FormLabel>
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
                                        <FormLabel>Resultado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="passed" className="text-green-600 font-medium">PASS (Aprovado)</SelectItem>
                                                <SelectItem value="failed" className="text-red-600 font-medium">FAIL (Reprovado)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.watch('result') === 'failed' && (
                            <Alert variant="destructive" className="py-2.5">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-xs font-semibold">Bloqueio Automático ISO/IEC 17025 §6.4.10</AlertTitle>
                                <AlertDescription className="text-xs">
                                    Ao registrar o resultado como <strong>FAIL</strong>, o instrumento será imediatamente bloqueado com status <strong>Reprovado</strong> e uma <strong>Não Conformidade (NC)</strong> será aberta automaticamente para investigação de impacto metrológico.
                                </AlertDescription>
                            </Alert>
                        )}

                        <FormField
                            control={form.control}
                            name="reference_standard_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Padrão de Referência Utilizado</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(val || undefined)}
                                        value={field.value ? String(field.value) : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o padrão de referência..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {standards.map(std => (
                                                <SelectItem key={std.id} value={String(std.id)}>
                                                    {std.name} {std.code ? `(${std.code})` : ''}
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
                                name="nominal_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Nominal (Padrão)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="Ex: 10.000"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => {
                                                    const val = e.target.value !== "" ? parseFloat(e.target.value) : null
                                                    field.onChange(val)
                                                    const measured = form.getValues('measured_value')
                                                    if (val !== null && measured !== null && measured !== undefined) {
                                                        form.setValue('deviation', Math.round((measured - val) * 100000) / 100000)
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="measured_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Medido (Indicação)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="Ex: 10.002"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => {
                                                    const val = e.target.value !== "" ? parseFloat(e.target.value) : null
                                                    field.onChange(val)
                                                    const nominal = form.getValues('nominal_value')
                                                    if (val !== null && nominal !== null && nominal !== undefined) {
                                                        form.setValue('deviation', Math.round((val - nominal) * 100000) / 100000)
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {form.watch('nominal_value') !== undefined && form.watch('nominal_value') !== null && form.watch('measured_value') !== undefined && form.watch('measured_value') !== null && (
                            <div className="p-2.5 rounded-md bg-muted/60 border text-xs flex justify-between items-center">
                                <span className="font-medium text-muted-foreground">Desvio Calculado (Erro de Indicação):</span>
                                <span className="font-mono font-bold text-foreground">
                                    {((Number(form.watch('measured_value')) || 0) - (Number(form.watch('nominal_value')) || 0)).toFixed(4)}
                                </span>
                            </div>
                        )}

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
