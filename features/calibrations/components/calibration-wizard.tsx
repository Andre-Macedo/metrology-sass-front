"use client"

import { WizardStepper } from "@/components/ui/wizard-stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Loader2, Fingerprint } from "lucide-react"
import { Calibration } from "@/lib/types"
import { SignatureModal } from "./signature-modal"
import { useCalibrationWizardState } from "../hooks/use-calibration-wizard-state"
import { StepIdentification } from "./wizard/step-identification"
import { StepMeasurements } from "./wizard/step-measurements"
import { StepAnalysis } from "./wizard/step-analysis"
import { StepResults } from "./wizard/step-results"

const STEPS = [
    { id: 'ident', title: 'Identificação', description: 'Ativo & Procedimento' },
    { id: 'readings', title: 'Medições', description: 'Execução de Ensaio' },
    { id: 'results', title: 'Análise & Decisão', description: 'Incerteza & Conclusão' },
]

export function CalibrationWizardForm({ initialData }: { initialData?: Calibration }) {
    const {
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
    } = useCalibrationWizardState(initialData)

    const selectedInstrument = formData.instrument_id
        ? instruments.find(i => i.id === formData.instrument_id)
        : undefined

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="border-b px-6 py-4 bg-muted/10">
                <WizardStepper steps={STEPS} currentStep={currentStep} />
            </CardHeader>

            <CardContent className="p-6 min-h-[420px]">
                {currentStep === 0 && (
                    <StepIdentification
                        formData={formData}
                        setFormData={setFormData}
                        instruments={instruments}
                        suppliers={suppliers}
                        templates={templates}
                        selectedTemplateId={selectedTemplateId}
                        setSelectedTemplateId={setSelectedTemplateId}
                        competenceData={competenceData}
                        supplierAccreditation={supplierAccreditation}
                    />
                )}

                {currentStep === 1 && (
                    <StepMeasurements
                        formData={formData}
                        setFormData={setFormData}
                        standards={standards}
                        updateReading={updateReading}
                        toggleAdjusted={toggleAdjusted}
                        updateItemResult={updateItemResult}
                        updateItemNotes={updateItemNotes}
                        onSkipToResults={() => setCurrentStep(2)}
                    />
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <StepAnalysis
                            formData={formData}
                            setFormData={setFormData}
                            calcResult={calcResult}
                            setShowBudget={setShowBudget}
                            triggerCalculate={triggerCalculate}
                            isCalculating={calculateMutation.isPending}
                        />

                        <StepResults
                            formData={formData}
                            setFormData={setFormData}
                            selectedInstrument={selectedInstrument}
                            calcResult={calcResult}
                            setCalcResult={() => {}}
                            showBudget={showBudget}
                            setShowBudget={setShowBudget}
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-4 bg-muted/10">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                >
                    Voltar
                </Button>

                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={handleNext} size="lg" className="px-8">
                        Avançar
                    </Button>
                ) : (
                    <Button
                        onClick={() => setIsSignatureModalOpen(true)}
                        disabled={isPending}
                        size="lg"
                        className="px-8 shadow-lg"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Finalizar & Assinar
                    </Button>
                )}
            </CardFooter>

            <SignatureModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                onConfirm={(password) => handleSubmit(password)}
                isLoading={isPending}
                title="Assinatura Eletrônica (FDA 21 CFR Part 11)"
                description="Para homologar e emitir este registro de calibração, digite sua senha de usuário. Esta ação tem validade jurídica e será associada à trilha de auditoria criptográfica."
            />
        </Card>
    )
}
