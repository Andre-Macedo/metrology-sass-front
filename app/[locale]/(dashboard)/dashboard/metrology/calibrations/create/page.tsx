"use client"

import { CalibrationWizardForm } from "@/features/calibrations"
import { PageHeader } from "@/components/layout/page-header"

export default function CreateCalibrationPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Executar Nova Calibração"
                description="Assistente técnico passo a passo para execução e registro metrológico"
            />
            <CalibrationWizardForm />
        </div>
    )
}
