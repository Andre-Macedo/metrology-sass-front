"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { CalibrationFormData } from "../../hooks/use-calibration-wizard-state"
import { calculateMaxDeviation } from "../../utils/metrology-math"

interface StepAnalysisProps {
    formData: CalibrationFormData
    setFormData: React.Dispatch<React.SetStateAction<CalibrationFormData>>
    calcResult: {
        uncertainty: number
        k_factor: number
        budget: any[]
    } | null
    setShowBudget: (show: boolean) => void
    triggerCalculate: () => void
    isCalculating: boolean
}

export function StepAnalysis({
    formData,
    setFormData,
    calcResult,
    setShowBudget,
    triggerCalculate,
    isCalculating
}: StepAnalysisProps) {
    const numericItems = formData.checklist_items?.filter(i => i.question_type === 'numeric' || !i.question_type) || []
    const hasData = numericItems.length > 0
    const isAdjusted = numericItems.some(i => i.adjusted)

    // Desvio máximo calculado através do domínio puro de metrologia
    const maxAsFoundDeviation = numericItems.reduce((max, item) => {
        const itemDev = calculateMaxDeviation(item.nominal_value || 0, item.as_found_readings || [])
        return Math.max(max, itemDev)
    }, 0)

    const maxAsLeftDeviation = numericItems.reduce((max, item) => {
        const readings = item.adjusted && item.as_left_readings?.length ? item.as_left_readings : (item.as_found_readings || [])
        const itemDev = calculateMaxDeviation(item.nominal_value || 0, readings)
        return Math.max(max, itemDev)
    }, 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            <div className="space-y-6">
                <div className="space-y-4 border rounded-lg p-5 bg-card shadow-sm">
                    <h3 className="font-semibold text-lg border-b pb-2">Condições Ambientais da Sala</h3>
                    <p className="text-xs text-muted-foreground">
                        Temperaturas fora da faixa padrão (20°C ± 2°C) influenciam a incerteza Tipo B por dilatação térmica.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="temperature-input">Temperatura (°C)</Label>
                            <Input
                                id="temperature-input"
                                type="number"
                                step="0.1"
                                placeholder="Ex: 20.0"
                                value={formData.temperature ?? ''}
                                onChange={e => setFormData(p => ({ ...p, temperature: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="humidity-input">Umidade Relativa (%)</Label>
                            <Input
                                id="humidity-input"
                                type="number"
                                step="0.1"
                                placeholder="Ex: 50.0"
                                value={formData.humidity ?? ''}
                                onChange={e => setFormData(p => ({ ...p, humidity: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-5 shadow-sm">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                        Análise de Execução & Incerteza (GUM)
                    </h3>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center border-b border-primary/10 pb-2.5">
                            <span className="font-medium text-muted-foreground">Desvio Máximo (As Found)</span>
                            <span className="font-mono text-base font-semibold">
                                {hasData ? `${maxAsFoundDeviation.toFixed(4)}` : 'N/A'}
                            </span>
                        </div>

                        {isAdjusted && (
                            <div className="flex justify-between items-center border-b border-primary/10 pb-2.5 text-green-700">
                                <span className="font-medium">Desvio Máximo Após Ajuste (As Left)</span>
                                <span className="font-mono text-base font-bold">
                                    {hasData ? `${maxAsLeftDeviation.toFixed(4)}` : 'N/A'}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-b border-primary/10 pb-2.5 min-h-[44px]">
                            <span className="font-medium text-muted-foreground">Incerteza Expandida (U)</span>
                            {calcResult ? (
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-base font-bold text-foreground">
                                        ± {calcResult.uncertainty} (k={calcResult.k_factor})
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs px-2.5"
                                        onClick={() => setShowBudget(true)}
                                    >
                                        Ver Orçamento ISO GUM
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 text-xs"
                                    disabled={isCalculating || !hasData}
                                    onClick={triggerCalculate}
                                >
                                    {isCalculating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                    Calcular Incerteza (GUM)
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
