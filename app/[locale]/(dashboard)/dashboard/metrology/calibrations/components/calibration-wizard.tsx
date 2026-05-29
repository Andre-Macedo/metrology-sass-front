"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { WizardStepper } from "@/components/ui/wizard-stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInstruments } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-instruments"
import { useCreateCalibration, useUpdateCalibration, useCalculateUncertainty, useCompetenceCheck } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations"
import { useSuppliers, useCheckSupplierAccreditation } from "@/features/system/hooks/use-system"
import { fetchChecklistTemplates, ChecklistTemplate } from "@/lib/api/procedures"
import { fetchStandards, ReferenceStandard } from "@/lib/api/standards"
import { Calibration, CalibrationChecklistItem, UncertaintyBudgetItem } from "@/lib/types"
import { toast } from "sonner"
import { Loader2, Upload, FileType, AlertTriangle, Ban, CheckCircle2, Fingerprint } from "lucide-react"
import { UncertaintyBudgetModal } from "@/components/metrology/uncertainty-budget-modal"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { SignatureModal } from "@/features/calibrations/components/signature-modal"

const STEPS = [
    { id: 'ident', title: 'Identification', description: 'Setup' },
    { id: 'readings', title: 'Measurements', description: 'Execution' },
    { id: 'results', title: 'Final Review', description: 'Decision' },
]

export function CalibrationWizardForm({ initialData }: { initialData?: Calibration }) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)

    // Hooks
    const { data: instrumentResult } = useInstruments({ per_page: 999 })
    const instruments = instrumentResult?.data || []

    const { data: suppliersResult } = useSuppliers(1, '', 999)
    const suppliers = suppliersResult?.data || []

    // Mutations
    const createMutation = useCreateCalibration()
    const updateMutation = useUpdateCalibration()
    const isPending = createMutation.isPending || updateMutation.isPending

    const [formData, setFormData] = useState<Partial<Calibration> & {
        calibration_type: 'internal' | 'external',
        standard_id?: string,
        provider_id?: number,
        checklist_items: CalibrationChecklistItem[],
        checklist_template_id?: string,
        password?: string
    }>
    ({
        date: new Date().toISOString().split('T')[0],
        technician: 'Current User', 
        result: 'pass',
        calibration_type: 'internal',
        checklist_items: [],
        ...initialData,
        checklist_template_id: initialData?.checklist_template_id || undefined
    })

    // Calculation State
    const [calcResult, setCalcResult] = useState<{
        uncertainty: number,
        k_factor: number,
        budget: UncertaintyBudgetItem[]
    } | null>(initialData?.uncertainty ? {
        uncertainty: parseFloat(initialData.uncertainty as any),
        k_factor: 2.00,
        budget: initialData.uncertainty_budget as any || []
    } : null)

    const [showBudget, setShowBudget] = useState(false)
    const calculateMutation = useCalculateUncertainty()

    // Data Source State
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
    const [standards, setStandards] = useState<ReferenceStandard[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialData?.checklist_template_id ?? "")

    // Accreditation & Competence Checks
    const selectedInstrument = formData.instrument_id 
        ? instruments.find(i => i.id === formData.instrument_id)
        : undefined;
    const selectedInstrumentTypeId = selectedInstrument?.instrument_type_id;

    const { data: competenceData } = useCompetenceCheck(selectedInstrumentTypeId ? Number(selectedInstrumentTypeId) : undefined);
    
    const { data: supplierAccreditation } = useCheckSupplierAccreditation(
        formData.provider_id || null,
        selectedInstrumentTypeId ? Number(selectedInstrumentTypeId) : null
    );

    // Load initial data
    useEffect(() => {
        const init = async () => {
            const [tpl, std] = await Promise.all([
                fetchChecklistTemplates(),
                fetchStandards()
            ])
            setTemplates(tpl)
            setStandards(std)
        }
        init()
    }, [])

    useEffect(() => {
        if (initialData && initialData.checklist_items && formData.checklist_items.length === 0) {
            setFormData(prev => ({ ...prev, checklist_items: initialData.checklist_items || [] }))
        }
    }, [initialData])


    // Handle Template Selection
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

    const handleNext = () => {
        if (currentStep === 0 && competenceData && !competenceData.can_proceed) {
            toast.error("Blocked: Unauthorized for this category.");
            return;
        }
        setCurrentStep(p => Math.min(STEPS.length - 1, p + 1))
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
                toast.success("Calibration updated successfully!")
            } else {
                await createMutation.mutateAsync(submissionData)
                toast.success("Calibration recorded successfully!")
            }
            setIsSignatureModalOpen(false)
            router.push("/dashboard/metrology/instruments/calibrations")
        } catch (e: any) {
            toast.error(e.message || "Failed to save")
        }
    }

    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Context & Identification
                    </h3>
                    <p className="text-sm text-muted-foreground">Define the context of this calibration.</p>
                </div>

                <div className="space-y-4 border rounded-lg p-5 bg-muted/10">
                    <div className="space-y-2">
                        <Label>Calibration Type</Label>
                        <Select
                            value={formData.calibration_type}
                            onValueChange={(v: any) => setFormData(p => ({ ...p, calibration_type: v, provider_id: v === 'internal' ? undefined : p.provider_id }))}
                        >
                            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="internal">Internal (Lab)</SelectItem>
                                <SelectItem value="external">External (Supplier)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.calibration_type === 'external' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label>External Provider (Supplier)</Label>
                            <Select
                                onValueChange={(val) => setFormData(p => ({ ...p, provider_id: Number(val) }))}
                                value={formData.provider_id?.toString()}
                            >
                                <SelectTrigger className="bg-background"><SelectValue placeholder="Select Lab..." /></SelectTrigger>
                                <SelectContent>
                                    {suppliers.filter(s => s.is_calibration_provider).map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.rbc_code || 'No RBC'})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            {formData.provider_id && supplierAccreditation && !supplierAccreditation.is_accredited && (
                                <Alert variant="warning" className="mt-2 py-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle className="text-xs">Accreditation Warning</AlertTitle>
                                    <AlertDescription className="text-[10px]">
                                        This lab is <strong>not accredited</strong> for {selectedInstrument?.instrument_type_name || 'this type'}. 
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Instrument</Label>
                        <Select
                            onValueChange={(val) => {
                                const inst = instruments.find(i => i.id === val)
                                setFormData(p => ({
                                    ...p,
                                    instrument_id: val,
                                    instrument_name: inst?.name || ''
                                }))
                            }}
                            value={formData.instrument_id || undefined}
                        >
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select Instrument" /></SelectTrigger>
                            <SelectContent>
                                {instruments.map(i => (
                                    <SelectItem key={i.id} value={i.id}>{i.name} ({i.serial_number})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {competenceData && !competenceData.has_competence && (
                            <Alert variant={competenceData.is_strict_enforced ? "destructive" : "warning"} className="mt-2 py-2">
                                {competenceData.is_strict_enforced ? <Ban className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                <AlertTitle className="text-xs">
                                    {competenceData.is_strict_enforced ? "Unauthorized" : "Training Expired"}
                                </AlertTitle>
                                <AlertDescription className="text-[10px]">
                                    Training record for this category is missing or expired.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Procedure & Responsibility
                    </h3>
                    <p className="text-sm text-muted-foreground">Who is performing this and how?</p>
                </div>

                <div className="space-y-4 border rounded-lg p-5 bg-muted/10">
                    <div className="space-y-2">
                        <Label>Procedure Template</Label>
                        <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name} (v{t.version || 1})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" className="bg-background" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Technician</Label>
                            <Input className="bg-background" value={formData.technician} onChange={e => setFormData({ ...formData, technician: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6 py-4">
            {formData.calibration_type === 'external' ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <FileType className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">External Calibration</p>
                    <p className="text-muted-foreground">Input measurements are optional for external calibrations.</p>
                    <Button variant="outline" className="mt-4" onClick={handleNext}>Skip to Results</Button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-secondary/20">
                        <div className="flex items-end gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Default Reference Standard / Kit Used</Label>
                                <Select
                                    onValueChange={(val) => setFormData(p => ({ ...p, standard_id: val }))}
                                    value={formData.standard_id}
                                >
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select the main standard used" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {standards.map(s => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name} ({s.serial_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="pb-2 text-sm text-muted-foreground">
                                <strong>{formData.checklist_items?.length || 0}</strong> Checkpoints
                            </div>
                        </div>

                        {(() => {
                            const selectedStandard = standards.find(s => s.id === formData.standard_id);
                            if (!selectedStandard) return null;

                            const isExpired = selectedStandard.next_calibration_date && new Date(selectedStandard.next_calibration_date) < new Date();
                            const isInactive = selectedStandard.status !== 'active';

                            if (isExpired || isInactive) {
                                return (
                                    <Alert variant="destructive" className="py-2 animate-in fade-in duration-300">
                                        <Ban className="h-4 w-4" />
                                        <AlertTitle className="text-xs font-bold uppercase tracking-tight">Standard Interlock Active</AlertTitle>
                                        <AlertDescription className="text-[10px] leading-relaxed">
                                            {isExpired && `This standard is EXPIRED since ${new Date(selectedStandard.next_calibration_date!).toLocaleDateString()}. `}
                                            {isInactive && `Current status is ${selectedStandard.status}. `}
                                            Usage is prohibited for official ISO 17025 calibrations.
                                        </AlertDescription>
                                    </Alert>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formData.checklist_items?.map((item, idx) => (
                            <Card key={idx} className="overflow-hidden flex flex-col">
                                <CardHeader className="py-3 px-4 bg-muted/40 border-b min-h-[60px] flex flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-2 max-w-[80%]">
                                        <span className="bg-primary/10 text-primary w-5 h-5 rounded flex items-center justify-center text-[10px] shadow-sm shrink-0">{idx + 1}</span>
                                        <span className="text-sm font-medium leading-tight line-clamp-2" title={item.step}>{item.step}</span>
                                    </div>
                                    {item.question_type === 'numeric' && (
                                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border whitespace-nowrap">Nom: {item.nominal_value}</span>
                                    )}
                                </CardHeader>

                                <CardContent className="p-4 bg-card flex-1 flex flex-col gap-4">
                                    {item.question_type === 'boolean' && (
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-xs text-muted-foreground">Result</Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={item.result === 'pass' ? 'default' : 'outline'}
                                                    className={item.result === 'pass' ? 'flex-1 bg-green-600 hover:bg-green-700' : 'flex-1 text-green-600 border-green-200 hover:bg-green-50'}
                                                    onClick={() => {
                                                        const newItems = [...(formData.checklist_items || [])]
                                                        newItems[idx].result = 'pass'
                                                        setFormData({ ...formData, checklist_items: newItems })
                                                    }}
                                                >
                                                    Pass / OK
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={item.result === 'fail' ? 'destructive' : 'outline'}
                                                    className={item.result === 'fail' ? 'flex-1' : 'flex-1 text-red-600 border-red-200 hover:bg-red-50'}
                                                    onClick={() => {
                                                        const newItems = [...(formData.checklist_items || [])]
                                                        newItems[idx].result = 'fail'
                                                        setFormData({ ...formData, checklist_items: newItems })
                                                    }}
                                                >
                                                    Fail / NOK
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {item.question_type === 'text' && (
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-xs text-muted-foreground">Observation</Label>
                                            <Textarea
                                                value={item.notes || ''}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                    const newItems = [...(formData.checklist_items || [])]
                                                    newItems[idx].notes = e.target.value
                                                    newItems[idx].result = e.target.value ? 'pass' : 'fail'
                                                    setFormData({ ...formData, checklist_items: newItems })
                                                }}
                                                placeholder="Enter observations..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    )}

                                    {(!item.question_type || item.question_type === 'numeric') && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">As Found</Label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        id={`adjust-${idx}`} 
                                                        checked={!!item.adjusted}
                                                        onChange={(e) => {
                                                            const newItems = [...(formData.checklist_items || [])]
                                                            newItems[idx].adjusted = e.target.checked
                                                            if (e.target.checked && (!newItems[idx].as_left_readings || newItems[idx].as_left_readings?.length === 0)) {
                                                                newItems[idx].as_left_readings = Array(newItems[idx].as_found_readings?.length || 1).fill(0)
                                                            }
                                                            setFormData({ ...formData, checklist_items: newItems })
                                                        }}
                                                    />
                                                    <label htmlFor={`adjust-${idx}`} className="text-[10px] font-medium cursor-pointer text-blue-600">Adjusted?</label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {item.as_found_readings?.map((reading: number | string, rIdx: number) => (
                                                    <Input
                                                        key={`found-${rIdx}`}
                                                        type="number"
                                                        step="any"
                                                        className="h-8 text-xs font-mono"
                                                        value={reading}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0
                                                            const newItems = [...(formData.checklist_items || [])]
                                                            newItems[idx].as_found_readings[rIdx] = val
                                                            setFormData({ ...formData, checklist_items: newItems })
                                                        }}
                                                    />
                                                ))}
                                            </div>

                                            {item.adjusted && (
                                                <div className="pt-2 border-t mt-2">
                                                    <Label className="text-[10px] uppercase text-green-600 font-semibold block mb-1">As Left (After)</Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {item.as_left_readings?.map((reading: number | string, rIdx: number) => (
                                                            <Input
                                                                key={`left-${rIdx}`}
                                                                type="number"
                                                                step="any"
                                                                className="h-8 text-xs font-mono border-green-200"
                                                                value={reading}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0
                                                                    const newItems = [...(formData.checklist_items || [])]
                                                                    if (!newItems[idx].as_left_readings) newItems[idx].as_left_readings = []
                                                                    newItems[idx].as_left_readings![rIdx] = val
                                                                    setFormData({ ...formData, checklist_items: newItems })
                                                                }}
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
                </>
            )}
        </div>
    )

    const renderStep3 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-6">
                <div className="space-y-4 border rounded-lg p-5">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-4">Environment Conditions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Temperature (°C)</Label>
                            <Input
                                type="number"
                                value={formData.temperature ?? ''}
                                onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Humidity (%)</Label>
                            <Input
                                type="number"
                                value={formData.humidity ?? ''}
                                onChange={e => setFormData({ ...formData, humidity: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-6">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                        Execution Analysis
                    </h3>

                    {(() => {
                        const numericItems = formData.checklist_items?.filter(i => i.question_type === 'numeric' || (!i.question_type)) || []
                        
                        const maxAsFoundDeviation = numericItems.reduce((max, item) => {
                            const itemReadings = item.as_found_readings || []
                            const itemDeviation = Math.max(0, ...itemReadings.map((r: number | string) => Math.abs((Number(r) || 0) - (item.nominal_value || 0))))
                            return Math.max(max, itemDeviation)
                        }, 0)

                        const maxAsLeftDeviation = numericItems.reduce((max, item) => {
                            const itemReadings = item.adjusted && item.as_left_readings ? item.as_left_readings : (item.as_found_readings || [])
                            const itemDeviation = Math.max(0, ...itemReadings.map((r: number | string) => Math.abs((Number(r) || 0) - (item.nominal_value || 0))))
                            return Math.max(max, itemDeviation)
                        }, 0)

                        const hasData = numericItems.length > 0
                        const isAdjusted = numericItems.some(i => i.adjusted)

                        return (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                                    <span className="font-medium text-muted-foreground">Max Deviation (As Found)</span>
                                    <span className="font-mono text-lg">{hasData ? `${maxAsFoundDeviation.toFixed(4)} mm` : 'N/A'}</span>
                                </div>
                                {isAdjusted && (
                                    <div className="flex justify-between items-center border-b border-primary/10 pb-2 text-green-600">
                                        <span className="font-medium">Max Deviation (As Left)</span>
                                        <span className="font-mono text-lg font-semibold">{hasData ? `${maxAsLeftDeviation.toFixed(4)} mm` : 'N/A'}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center border-b border-primary/10 pb-2 h-10">
                                    <span className="font-medium text-muted-foreground">Uncertainty (U)</span>
                                    {calcResult ? (
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-lg font-semibold">
                                                {calcResult.uncertainty} mm
                                            </span>
                                            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setShowBudget(true)}>ISO GUM</Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            disabled={calculateMutation.isPending || !hasData}
                                            onClick={() => {
                                                calculateMutation.mutate({
                                                    checklist_template_id: formData.checklist_template_id,
                                                    items: formData.checklist_items,
                                                    instrument_id: formData.instrument_id,
                                                    temperature: formData.temperature
                                                }, {
                                                    onSuccess: (res) => {
                                                        setCalcResult({
                                                            uncertainty: res.uncertainty,
                                                            k_factor: res.k_factor,
                                                            budget: res.uncertainty_budget
                                                        })
                                                        toast.success("Uncertainty calculated!")
                                                    }
                                                })
                                            }}
                                        >
                                            Calculate
                                        </Button>
                                    )}
                                </div>

                                {calcResult && (
                                    <UncertaintyBudgetModal
                                        isOpen={showBudget}
                                        onClose={() => setShowBudget(false)}
                                        budget={calcResult.budget}
                                        kFactor={calcResult.k_factor}
                                        onSave={(newBudget, newExpandedUncertainty) => {
                                            setCalcResult({ ...calcResult, budget: newBudget, uncertainty: Number(newExpandedUncertainty.toFixed(5)) })
                                            setFormData(prev => ({ ...prev, uncertainty: Number(newExpandedUncertainty.toFixed(5)), uncertainty_budget: newBudget }))
                                        }}
                                    />
                                )}

                                {(() => {
                                    if (!calcResult || !selectedInstrument) return null;
                                    
                                    const mpe = selectedInstrument.mpe_value || 0;
                                    const dev = maxAsLeftDeviation;
                                    const u = calcResult.uncertainty;
                                    const rule = selectedInstrument.instrument_type?.decision_rule || 'simple';
                                    const w = selectedInstrument.instrument_type?.guard_band_multiplier || 1.0;
                                    
                                    let status: 'approved' | 'rejected' | 'conditional_pass' = 'approved';
                                    let ruleLabel = "Simple Acceptance";

                                    if (rule === 'simple') {
                                        status = dev <= mpe ? 'approved' : 'rejected';
                                    } else if (rule === 'uncertainty_accounted') {
                                        ruleLabel = "Uncertainty Accounted";
                                        status = (dev + u) <= mpe ? 'approved' : 'rejected';
                                    } else if (rule === 'guard_band') {
                                        ruleLabel = `Guard Band (w=${w})`;
                                        const limit = mpe - (w * u);
                                        if (dev <= limit) status = 'approved';
                                        else if (dev <= mpe) status = 'conditional_pass';
                                        else status = 'rejected';
                                    }

                                    return (
                                        <div className="mt-4 p-3 rounded bg-background/50 border border-primary/10">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Decision Rule applied: {ruleLabel}</p>
                                            <div className="flex items-center gap-2">
                                                {status === 'approved' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                {status === 'conditional_pass' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                                                {status === 'rejected' && <Ban className="h-4 w-4 text-red-600" />}
                                                <span className="text-sm font-semibold">
                                                    Suggested Verdict: {status === 'approved' ? 'PASS' : status === 'conditional_pass' ? 'ZONE OF DOUBT' : 'FAIL'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )
                    })()}
                </div>

                <div className="space-y-4 pl-1">
                    <Label className="text-lg">Final Verdict</Label>
                    <Select value={formData.result} onValueChange={(v: any) => setFormData({ ...formData, result: v })}>
                        <SelectTrigger className="h-14 text-lg font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="approved" className="text-green-600 font-bold">✅ Approved</SelectItem>
                            <SelectItem value="conditional_pass" className="text-yellow-600 font-bold">⚠️ Conditional Pass</SelectItem>
                            <SelectItem value="rejected" className="text-red-600 font-bold">❌ Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="space-y-2">
                        <Label>Statement of Conformity (ISO 17025)</Label>
                        <Textarea 
                            placeholder="Frase formal que aparecerá no certificado..."
                            className="min-h-[80px] bg-muted/20"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            This statement will be printed on the final calibration certificate.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="border-b px-6 py-4 bg-muted/10">
                <WizardStepper steps={STEPS} currentStep={currentStep} />
            </CardHeader>

            <CardContent className="p-6 min-h-[400px]">
                {currentStep === 0 && renderStep1()}
                {currentStep === 1 && renderStep2()}
                {currentStep === 2 && renderStep3()}
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-4 bg-muted/10">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>Previous</Button>
                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={handleNext} size="lg" className="px-8">Next</Button>
                ) : (
                    <Button onClick={() => setIsSignatureModalOpen(true)} disabled={isPending} size="lg" className="px-8 shadow-lg">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Finalize & Sign
                    </Button>
                )}
            </CardFooter>

            <SignatureModal 
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onConfirm={(password) => handleSubmit(password)}
                isLoading={isPending}
                title="Electronic Signature"
                description="To finalize this calibration record, please re-authenticate by entering your password. This action will be logged as your official signature."
            />
        </Card>
    )
}
