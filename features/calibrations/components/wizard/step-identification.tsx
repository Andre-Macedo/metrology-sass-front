"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Ban, CheckCircle2, Fingerprint } from "lucide-react"
import { CalibrationFormData } from "../../hooks/use-calibration-wizard-state"
import { ChecklistTemplate } from "@/lib/api/procedures"

interface StepIdentificationProps {
    formData: CalibrationFormData
    setFormData: React.Dispatch<React.SetStateAction<CalibrationFormData>>
    instruments: any[]
    suppliers: any[]
    templates: ChecklistTemplate[]
    selectedTemplateId: string
    setSelectedTemplateId: (id: string) => void
    competenceData?: any
    supplierAccreditation?: any
}

export function StepIdentification({
    formData,
    setFormData,
    instruments,
    suppliers,
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    competenceData,
    supplierAccreditation
}: StepIdentificationProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4 border rounded-lg p-5 bg-card shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 flex items-center justify-between">
                    <span>Target Instrument</span>
                    {formData.instrument_id && (
                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                            TAG Identificada
                        </span>
                    )}
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="instrument-select">Select Instrument to Calibrate</Label>
                    <Select
                        value={formData.instrument_id || ""}
                        onValueChange={(val) => setFormData(p => ({ ...p, instrument_id: val }))}
                    >
                        <SelectTrigger id="instrument-select" className="bg-background">
                            <SelectValue placeholder="Search or select an instrument..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {instruments.map(inst => (
                                <SelectItem key={inst.id} value={inst.id}>
                                    <span className="font-medium">{inst.name}</span>
                                    <span className="text-muted-foreground ml-2">({inst.serial_number || inst.tag || 'No Tag'})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Calibration Scope</Label>
                    <Select
                        value={formData.calibration_type}
                        onValueChange={(val: 'internal' | 'external') => setFormData(p => ({ ...p, calibration_type: val }))}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="internal">Internal Calibration (In-House)</SelectItem>
                            <SelectItem value="external">External Provider (Third-Party)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.calibration_type === 'external' ? (
                    <div className="space-y-2 pt-2 border-t">
                        <Label>Accredited Calibration Provider</Label>
                        <Select
                            value={formData.provider_id ? String(formData.provider_id) : ""}
                            onValueChange={(val) => setFormData(p => ({ ...p, provider_id: Number(val) }))}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select supplier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map(sup => (
                                    <SelectItem key={sup.id} value={String(sup.id)}>
                                        {sup.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {supplierAccreditation && (
                            <div className="mt-3">
                                {supplierAccreditation.is_accredited ? (
                                    <Alert className="border-green-200 bg-green-50/50 text-green-900">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-sm font-semibold">Fornecedor Acreditado (RBC/Cgcre)</AlertTitle>
                                        <AlertDescription className="text-xs text-green-800">
                                            Escopo válido até {supplierAccreditation.valid_until ? new Date(supplierAccreditation.valid_until).toLocaleDateString() : 'data indeterminada'}.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle className="text-sm font-semibold">Alerta de Acreditação</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            {supplierAccreditation.reason || "Este fornecedor não possui escopo acreditado ativo para esta categoria de instrumento."}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    competenceData && (
                        <div className="mt-3">
                            {competenceData.can_proceed ? (
                                <Alert className="border-green-200 bg-green-50/50 text-green-900 py-3">
                                    <Fingerprint className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-sm font-semibold">Competência Técnica Homologada (ISO 17025 §6.2)</AlertTitle>
                                    <AlertDescription className="text-xs text-green-800">
                                        {competenceData.message}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive" className="py-3">
                                    <Ban className="h-4 w-4" />
                                    <AlertTitle className="text-sm font-semibold uppercase tracking-tight">Bloqueio Operacional: Sem Autorização</AlertTitle>
                                    <AlertDescription className="text-xs leading-relaxed">
                                        {competenceData.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )
                )}
            </div>

            <div className="space-y-4 border rounded-lg p-5 bg-card shadow-sm">
                <div className="space-y-1 border-b pb-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span>Procedimento Metrológico & Responsabilidade</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Quem executa a calibração e qual roteiro técnico normatizado será aplicado?</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="template-select">Procedure Template</Label>
                    <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
                        <SelectTrigger id="template-select" className="bg-background">
                            <SelectValue placeholder="Selecione o procedimento de calibração..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    <span className="font-medium">{t.name}</span>
                                    <span className="text-muted-foreground ml-2 text-xs">(v{t.version || 1})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="date-input">Data da Calibração</Label>
                        <Input
                            id="date-input"
                            type="date"
                            className="bg-background"
                            value={formData.date || ''}
                            onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="technician-input">Metrologista Responsável</Label>
                        <Input
                            id="technician-input"
                            className="bg-background"
                            value={formData.technician || ''}
                            onChange={e => setFormData(p => ({ ...p, technician: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
