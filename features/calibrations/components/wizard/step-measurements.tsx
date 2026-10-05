"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ban, FileType, LayoutGrid, Table as TableIcon } from "lucide-react"
import { CalibrationFormData } from "../../hooks/use-calibration-wizard-state"
import { ReferenceStandard } from "@/lib/api/standards"

interface StepMeasurementsProps {
    formData: CalibrationFormData
    setFormData: React.Dispatch<React.SetStateAction<CalibrationFormData>>
    standards: ReferenceStandard[]
    updateReading: (itemIndex: number, readingIndex: number, value: number, type: 'as_found' | 'as_left') => void
    toggleAdjusted: (itemIndex: number, adjusted: boolean) => void
    updateItemResult: (itemIndex: number, result: 'pass' | 'fail') => void
    updateItemNotes: (itemIndex: number, notes: string) => void
    onSkipToResults: () => void
}

export function StepMeasurements({
    formData,
    setFormData,
    standards,
    updateReading,
    toggleAdjusted,
    updateItemResult,
    updateItemNotes,
    onSkipToResults
}: StepMeasurementsProps) {
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

    if (formData.calibration_type === 'external') {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 text-center">
                <FileType className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Calibração Terceirizada (Externa)</p>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                    A digitação manual de pontos de ensaio é opcional para calibrações externas. Você pode avançar diretamente para anexar o certificado em PDF emitido pelo prestador RBC.
                </p>
                <Button variant="outline" className="mt-5" onClick={onSkipToResults}>
                    Avançar para Resultados & Anexo
                </Button>
            </div>
        )
    }

    const selectedStandard = standards.find(s => s.id === formData.standard_id)
    const isStandardExpired = selectedStandard?.next_calibration_date && new Date(selectedStandard.next_calibration_date) < new Date()
    const isStandardInactive = selectedStandard && selectedStandard.status !== 'active'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-secondary/15">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="standard-select">Padrão de Referência Metrológica / Kit Utilizado</Label>
                        <Select
                            value={formData.standard_id || ""}
                            onValueChange={(val) => setFormData(p => ({ ...p, standard_id: val }))}
                        >
                            <SelectTrigger id="standard-select" className="bg-background">
                                <SelectValue placeholder="Selecione o padrão de referência utilizado..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {standards.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <span className="font-medium">{s.name}</span>
                                        <span className="text-muted-foreground ml-2 text-xs">({s.serial_number})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground font-medium bg-background px-3 py-1.5 rounded border">
                            <strong>{formData.checklist_items?.length || 0}</strong> Pontos de Ensaio
                        </div>
                        <div className="flex items-center border rounded-md p-0.5 bg-background">
                            <Button
                                size="sm"
                                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                                className="h-7 px-2.5 text-xs"
                                onClick={() => setViewMode('cards')}
                                title="Visualização em Cards"
                            >
                                <LayoutGrid className="h-3.5 w-3.5 mr-1" /> Cards
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                className="h-7 px-2.5 text-xs"
                                onClick={() => setViewMode('table')}
                                title="Visualização em Planilha / Matriz"
                            >
                                <TableIcon className="h-3.5 w-3.5 mr-1" /> Tabela
                            </Button>
                        </div>
                    </div>
                </div>

                {(isStandardExpired || isStandardInactive) && (
                    <Alert variant="destructive" className="py-2.5">
                        <Ban className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase tracking-tight">Intertravamento de Padrão Ativo (Standard Interlock)</AlertTitle>
                        <AlertDescription className="text-xs leading-relaxed">
                            {isStandardExpired && `Este padrão está VENCIDO desde ${new Date(selectedStandard!.next_calibration_date!).toLocaleDateString()}. `}
                            {isStandardInactive && `O status do padrão é "${selectedStandard!.status}". `}
                            O uso deste ativo é bloqueado para emissão de certificados oficiais ISO 17025.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {formData.checklist_items?.map((item, idx) => (
                        <Card key={idx} className="overflow-hidden flex flex-col shadow-sm border">
                            <CardHeader className="py-2.5 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2 max-w-[75%]">
                                    <span className="bg-primary/10 text-primary w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold leading-tight line-clamp-1" title={item.step}>
                                        {item.step}
                                    </span>
                                </div>
                                {item.question_type === 'numeric' && (
                                    <span className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border whitespace-nowrap">
                                        Nom: {item.nominal_value}
                                    </span>
                                )}
                            </CardHeader>

                            <CardContent className="p-4 bg-card flex-1 flex flex-col gap-3">
                                {item.question_type === 'boolean' && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Avaliação de Conformidade</Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant={item.result === 'pass' ? 'default' : 'outline'}
                                                className={item.result === 'pass' ? 'flex-1 bg-green-600 hover:bg-green-700 text-xs' : 'flex-1 text-green-700 border-green-200 text-xs'}
                                                onClick={() => updateItemResult(idx, 'pass')}
                                            >
                                                Conforme / OK
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={item.result === 'fail' ? 'destructive' : 'outline'}
                                                className={item.result === 'fail' ? 'flex-1 text-xs' : 'flex-1 text-red-600 border-red-200 text-xs'}
                                                onClick={() => updateItemResult(idx, 'fail')}
                                            >
                                                Não Conforme
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {item.question_type === 'text' && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Observação</Label>
                                        <Textarea
                                            value={item.notes || ''}
                                            onChange={(e) => updateItemNotes(idx, e.target.value)}
                                            placeholder="Descreva as condições..."
                                            className="min-h-[70px] text-xs"
                                        />
                                    </div>
                                )}

                                {(!item.question_type || item.question_type === 'numeric') && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Leituras (As Found)
                                            </Label>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="checkbox"
                                                    id={`adjust-${idx}`}
                                                    checked={!!item.adjusted}
                                                    onChange={(e) => toggleAdjusted(idx, e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor={`adjust-${idx}`} className="text-[11px] font-medium cursor-pointer text-blue-600">
                                                    Ajustado?
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {item.as_found_readings?.map((reading, rIdx) => (
                                                <Input
                                                    key={`found-${rIdx}`}
                                                    type="number"
                                                    step="any"
                                                    className="h-8 text-xs font-mono"
                                                    value={reading ?? 0}
                                                    onChange={(e) => updateReading(idx, rIdx, parseFloat(e.target.value) || 0, 'as_found')}
                                                />
                                            ))}
                                        </div>

                                        {item.adjusted && (
                                            <div className="pt-2 border-t mt-2">
                                                <Label className="text-[10px] uppercase text-green-700 font-semibold block mb-1">
                                                    Leituras Após Ajuste (As Left)
                                                </Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {item.as_left_readings?.map((reading, rIdx) => (
                                                        <Input
                                                            key={`left-${rIdx}`}
                                                            type="number"
                                                            step="any"
                                                            className="h-8 text-xs font-mono border-green-300"
                                                            value={reading ?? 0}
                                                            onChange={(e) => updateReading(idx, rIdx, parseFloat(e.target.value) || 0, 'as_left')}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="border rounded-lg overflow-x-auto bg-card shadow-sm">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
                            <tr>
                                <th className="p-3 w-12 text-center">#</th>
                                <th className="p-3 min-w-[180px]">Ponto / Descrição</th>
                                <th className="p-3 w-28">Nominal</th>
                                <th className="p-3 min-w-[200px]">Leituras (As Found)</th>
                                <th className="p-3 w-24 text-center">Ajuste?</th>
                                <th className="p-3 min-w-[200px]">Leituras (As Left)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {formData.checklist_items?.map((item, idx) => (
                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                    <td className="p-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                                    <td className="p-3 font-medium">{item.step}</td>
                                    <td className="p-3 font-mono text-muted-foreground">
                                        {item.question_type === 'numeric' ? item.nominal_value : 'N/A'}
                                    </td>
                                    <td className="p-3">
                                        {item.question_type === 'numeric' ? (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {item.as_found_readings?.map((reading, rIdx) => (
                                                    <Input
                                                        key={`tbl-found-${rIdx}`}
                                                        type="number"
                                                        step="any"
                                                        className="h-7 w-20 text-xs font-mono"
                                                        value={reading ?? 0}
                                                        onChange={(e) => updateReading(idx, rIdx, parseFloat(e.target.value) || 0, 'as_found')}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">Checklist qualitativo</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.question_type === 'numeric' && (
                                            <input
                                                type="checkbox"
                                                checked={!!item.adjusted}
                                                onChange={(e) => toggleAdjusted(idx, e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {item.adjusted && item.as_left_readings ? (
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {item.as_left_readings.map((reading, rIdx) => (
                                                    <Input
                                                        key={`tbl-left-${rIdx}`}
                                                        type="number"
                                                        step="any"
                                                        className="h-7 w-20 text-xs font-mono border-green-300"
                                                        value={reading ?? 0}
                                                        onChange={(e) => updateReading(idx, rIdx, parseFloat(e.target.value) || 0, 'as_left')}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-[11px]">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
