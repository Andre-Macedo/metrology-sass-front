"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertTriangle, Ban } from "lucide-react"
import { CalibrationFormData } from "../../hooks/use-calibration-wizard-state"
import { UncertaintyBudgetModal } from "@/components/metrology/uncertainty-budget-modal"
import { calculateMaxDeviation, evaluateConformity } from "../../utils/metrology-math"

interface StepResultsProps {
    formData: CalibrationFormData
    setFormData: React.Dispatch<React.SetStateAction<CalibrationFormData>>
    selectedInstrument?: any
    calcResult: {
        uncertainty: number
        k_factor: number
        budget: any[]
    } | null
    setCalcResult: (res: any) => void
    showBudget: boolean
    setShowBudget: (show: boolean) => void
}

export function StepResults({
    formData,
    setFormData,
    selectedInstrument,
    calcResult,
    setCalcResult,
    showBudget,
    setShowBudget
}: StepResultsProps) {
    const numericItems = formData.checklist_items?.filter(i => i.question_type === 'numeric' || !i.question_type) || []
    const isAdjusted = numericItems.some(i => i.adjusted)

    const maxDeviation = numericItems.reduce((max, item) => {
        const readings = isAdjusted && item.as_left_readings?.length ? item.as_left_readings : (item.as_found_readings || [])
        const itemDev = calculateMaxDeviation(item.nominal_value || 0, readings)
        return Math.max(max, itemDev)
    }, 0)

    const inst = selectedInstrument as any
    const mpe = Number(inst?.mpe_value ?? inst?.mpe ?? 0)
    const u = calcResult?.uncertainty ?? 0
    const rule = inst?.instrument_type?.decision_rule || inst?.type?.decision_rule || 'simple'
    const w = Number(inst?.guard_band_multiplier_override ?? inst?.instrument_type?.guard_band_multiplier ?? inst?.type?.guard_band_multiplier ?? 1.0)

    // Avaliação via utilitário de domínio puro
    const suggestedVerdict = evaluateConformity(maxDeviation, mpe, rule === 'simple' ? 0 : u, w)

    return (
        <div className="space-y-6 py-2">
            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card border shadow-sm space-y-3">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                        Regra de Decisão Aplicada: {rule === 'guard_band' ? `Banda de Guarda (w=${w})` : rule === 'uncertainty_accounted' ? 'Incerteza Contabilizada' : 'Aceitação Simples'}
                    </p>
                    <div className="flex items-center gap-3">
                        {suggestedVerdict === 'pass' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {suggestedVerdict === 'conditional' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                        {suggestedVerdict === 'fail' && <Ban className="h-5 w-5 text-red-600" />}
                        <span className="text-base font-semibold">
                            Veredicto Técnico Sugerido: {suggestedVerdict === 'pass' ? 'APROVADO (Dentro do MPE)' : suggestedVerdict === 'conditional' ? 'APROVADO CONDICIONAL (Zona de Risco Compartilhado)' : 'REPROVADO (Fora da Tolerância)'}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="final-verdict-select" className="text-sm font-semibold">Decisão Final da Calibração</Label>
                        <Select
                            value={formData.result || "approved"}
                            onValueChange={(v: any) => setFormData(p => ({ ...p, result: v }))}
                        >
                            <SelectTrigger id="final-verdict-select" className="h-12 text-base font-medium bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="approved" className="text-green-600 font-bold">Aprovado (Atende aos Requisitos)</SelectItem>
                                <SelectItem value="conditional_pass" className="text-yellow-600 font-bold">Aprovado com Restrições / Condicional</SelectItem>
                                <SelectItem value="rejected" className="text-red-600 font-bold">Reprovado (Não Conforme)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="conformity-statement">Declaração de Conformidade (ISO 17025 §7.8.6)</Label>
                        <Textarea
                            id="conformity-statement"
                            placeholder="Frase formal que será impressa no certificado de calibração..."
                            className="min-h-[90px] bg-background text-xs leading-relaxed"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                        />
                        <p className="text-[11px] text-muted-foreground italic">
                            Esta declaração de conformidade e as regras de decisão aplicadas serão gravadas no relatório final e assinadas digitalmente.
                        </p>
                    </div>
                </div>
            </div>

            {calcResult && showBudget && (
                <UncertaintyBudgetModal
                    isOpen={showBudget}
                    onClose={() => setShowBudget(false)}
                    budget={calcResult.budget}
                    kFactor={calcResult.k_factor}
                    onSave={(newBudget, newExpandedUncertainty) => {
                        setCalcResult({
                            ...calcResult,
                            budget: newBudget,
                            uncertainty: Number(newExpandedUncertainty.toFixed(5))
                        })
                        setFormData(prev => ({
                            ...prev,
                            uncertainty: Number(newExpandedUncertainty.toFixed(5)),
                            uncertainty_budget: newBudget
                        }))
                    }}
                />
            )}
        </div>
    )
}
