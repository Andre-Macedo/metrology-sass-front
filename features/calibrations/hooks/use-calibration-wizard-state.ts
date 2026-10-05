"use client"

import { useState, useEffect, useCallback } from "react"
import { Calibration, CalibrationChecklistItem, UncertaintyBudgetItem } from "@/lib/types"
import { fetchChecklistTemplates, ChecklistTemplate } from "@/lib/api/procedures"
import { fetchStandards, ReferenceStandard } from "@/lib/api/standards"
import { useInstruments } from "@/features/instruments"
import { useSuppliers, useCheckSupplierAccreditation } from "@/features/system/hooks/use-system"
import { useCreateCalibration, useUpdateCalibration, useCalculateUncertainty, useCompetenceCheck } from "./use-calibrations"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"

export interface CalibrationFormData extends Partial<Calibration> {
    calibration_type: 'internal' | 'external'
    standard_id?: string
    provider_id?: number
    checklist_items: CalibrationChecklistItem[]
    checklist_template_id?: string
    password?: string
    temperature?: number
    humidity?: number
}

export function useCalibrationWizardState(initialData?: Calibration) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
    const [showBudget, setShowBudget] = useState(false)

    // Consultas principais
    const { data: instrumentResult } = useInstruments({ per_page: 999 })
    const instruments = instrumentResult?.data || []

    const { data: suppliersResult } = useSuppliers(1, '', 999)
    const suppliers = suppliersResult?.data || []

    // Mutações
    const createMutation = useCreateCalibration()
    const updateMutation = useUpdateCalibration()
    const calculateMutation = useCalculateUncertainty()
    const isPending = createMutation.isPending || updateMutation.isPending

    // Estado do formulário
    const [formData, setFormData] = useState<CalibrationFormData>({
        date: new Date().toISOString().split('T')[0],
        technician: 'Current User',
        result: 'pass',
        calibration_type: 'internal',
        checklist_items: [],
        ...initialData,
        checklist_template_id: initialData?.checklist_template_id || undefined
    })

    // Estado dos cálculos de incerteza
    const [calcResult, setCalcResult] = useState<{
        uncertainty: number
        k_factor: number
        budget: UncertaintyBudgetItem[]
    } | null>(initialData?.uncertainty ? {
        uncertainty: parseFloat(initialData.uncertainty as any),
        k_factor: 2.00,
        budget: initialData.uncertainty_budget as any || []
    } : null)

    // Fontes de dados assíncronas
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
    const [standards, setStandards] = useState<ReferenceStandard[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialData?.checklist_template_id ?? "")

    // Ativo e competência
    const selectedInstrument = formData.instrument_id
        ? instruments.find(i => i.id === formData.instrument_id)
        : undefined
    const selectedInstrumentTypeId = selectedInstrument?.instrument_type_id

    const { data: competenceData } = useCompetenceCheck(selectedInstrumentTypeId ? Number(selectedInstrumentTypeId) : undefined)
    const { data: supplierAccreditation } = useCheckSupplierAccreditation(
        formData.provider_id || null,
        selectedInstrumentTypeId ? Number(selectedInstrumentTypeId) : null
    )

    // Carga inicial de templates e padrões
    useEffect(() => {
        let mounted = true
        const init = async () => {
            try {
                const [tpl, std] = await Promise.all([
                    fetchChecklistTemplates(),
                    fetchStandards()
                ])
                if (mounted) {
                    setTemplates(tpl)
                    setStandards(std)
                }
            } catch (err) {
                console.error("Falha ao carregar templates ou padrões:", err)
            }
        }
        init()
        return () => { mounted = false }
    }, [])

    // Auto-seleção do template com base no instrumento selecionado
    useEffect(() => {
        if (!selectedInstrument || formData.checklist_template_id) return

        // 1. Tenta pegar o default_checklist_template vindo da API
        const defaultTpl = (selectedInstrument as any).default_checklist_template
        if (defaultTpl?.id) {
            setSelectedTemplateId(defaultTpl.id)
            return
        }

        // 2. Fallback: Procura templates compatíveis com o tipo de instrumento
        if (selectedInstrument.instrument_type_id && templates.length > 0) {
            const matchingTpl = templates.find(t => (t as any).instrument_type_id === selectedInstrument.instrument_type_id)
            if (matchingTpl) {
                setSelectedTemplateId(matchingTpl.id)
            }
        }
    }, [selectedInstrument, templates, formData.checklist_template_id])

    // Carga inicial de itens se for edição
    useEffect(() => {
        if (initialData && initialData.checklist_items && formData.checklist_items.length === 0) {
            setFormData(prev => ({ ...prev, checklist_items: initialData.checklist_items || [] }))
        }
    }, [initialData])

    // Aplicação do template selecionado
    useEffect(() => {
        if (selectedTemplateId && selectedTemplateId !== initialData?.checklist_template_id) {
            const template = templates.find(t => t.id === selectedTemplateId)
            if (template) {
                const items = template.items.map((item): CalibrationChecklistItem => ({
                    step: item.step,
                    template_item_id: item.id,
                    nominal_value: item.nominal_value || 0,
                    as_found_readings: Array(item.required_readings || 1).fill(0),
                    as_left_readings: [],
                    adjusted: false,
                    result: 'pass',
                    question_type: (item.question_type || 'numeric') as CalibrationChecklistItem['question_type'],
                    notes: '',
                    standard_id: undefined
                }))
                setFormData(prev => ({
                    ...prev,
                    checklist_items: items,
                    checklist_template_id: selectedTemplateId
                }))
            }
        }
    }, [selectedTemplateId, templates, initialData])

    // Atualização de leitura com imutabilidade estrita
    const updateReading = useCallback((
        itemIndex: number,
        readingIndex: number,
        value: number,
        type: 'as_found' | 'as_left'
    ) => {
        setFormData(prev => {
            const newChecklistItems = prev.checklist_items.map((item, idx) => {
                if (idx !== itemIndex) return item

                const sourceArray = type === 'as_found'
                    ? (item.as_found_readings ? [...item.as_found_readings] : [0])
                    : (item.as_left_readings ? [...item.as_left_readings] : [0])

                sourceArray[readingIndex] = value

                return {
                    ...item,
                    [type === 'as_found' ? 'as_found_readings' : 'as_left_readings']: sourceArray
                }
            })

            return {
                ...prev,
                checklist_items: newChecklistItems
            }
        })
    }, [])

    const toggleAdjusted = useCallback((itemIndex: number, adjusted: boolean) => {
        setFormData(prev => {
            const newChecklistItems = prev.checklist_items.map((item, idx) => {
                if (idx !== itemIndex) return item
                const leftReadings = adjusted && (!item.as_left_readings || item.as_left_readings.length === 0)
                    ? Array(item.as_found_readings?.length || 1).fill(0)
                    : item.as_left_readings

                return {
                    ...item,
                    adjusted,
                    as_left_readings: leftReadings
                }
            })
            return { ...prev, checklist_items: newChecklistItems }
        })
    }, [])

    const updateItemResult = useCallback((itemIndex: number, result: 'pass' | 'fail') => {
        setFormData(prev => ({
            ...prev,
            checklist_items: prev.checklist_items.map((item, idx) => idx === itemIndex ? { ...item, result } : item)
        }))
    }, [])

    const updateItemNotes = useCallback((itemIndex: number, notes: string) => {
        setFormData(prev => ({
            ...prev,
            checklist_items: prev.checklist_items.map((item, idx) => idx === itemIndex ? { ...item, notes, result: notes ? 'pass' : 'fail' } : item)
        }))
    }, [])

    const handleNext = () => {
        if (currentStep === 0 && competenceData && !competenceData.can_proceed) {
            toast.error("Blocked: Unauthorized for this category.")
            return
        }
        setCurrentStep(p => Math.min(2, p + 1))
    }

    const handleBack = () => setCurrentStep(p => Math.max(0, p - 1))

    const handleSubmit = async (password?: string) => {
        if (!password) {
            setIsSignatureModalOpen(true)
            return
        }

        try {
            const submissionData = { ...formData, password }
            if (initialData?.id) {
                await updateMutation.mutateAsync({ id: initialData.id, data: submissionData })
                toast.success("Calibration updated successfully")
            } else {
                await createMutation.mutateAsync(submissionData)
                toast.success("Calibration created and signed successfully")
            }
            router.push("/dashboard/metrology/calibrations")
        } catch (error: any) {
            toast.error(error.message || "Failed to submit calibration")
        } finally {
            setIsSignatureModalOpen(false)
        }
    }

    const triggerCalculate = () => {
        calculateMutation.mutate({
            checklist_template_id: formData.checklist_template_id,
            items: formData.checklist_items,
            instrument_id: formData.instrument_id,
            temperature: formData.temperature
        }, {
            onSuccess: (data: any) => {
                setCalcResult({
                    uncertainty: data.uncertainty,
                    k_factor: data.k_factor,
                    budget: data.budget
                })
                setFormData(p => ({
                    ...p,
                    uncertainty: data.uncertainty,
                    uncertainty_budget: data.budget
                }))
                toast.success("Incerteza calculada com sucesso!")
            },
            onError: (err: any) => {
                toast.error(err.message || "Falha no cálculo da incerteza.")
            }
        })
    }

    return {
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        calcResult,
        showBudget,
        setShowBudget,
        isSignatureModalOpen,
        setIsSignatureModalOpen,
        isPending,
        instruments,
        suppliers,
        standards,
        templates,
        selectedTemplateId,
        setSelectedTemplateId,
        competenceData,
        supplierAccreditation,
        calculateMutation,
        updateReading,
        toggleAdjusted,
        updateItemResult,
        updateItemNotes,
        handleNext,
        handleBack,
        handleSubmit,
        triggerCalculate
    }
}
