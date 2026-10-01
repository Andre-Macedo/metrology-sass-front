"use client"

import { CalibrationWizardForm, useCalibration } from "@/features/calibrations"
import { PageHeader } from "@/components/layout/page-header"
import { useParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function EditCalibrationPage() {
    const params = useParams()
    const id = params.id as string
    const { data: calibration, isLoading } = useCalibration(id)

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!calibration) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Calibração não encontrada.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Editar Calibração: ${calibration.certificate_number || calibration.id}`}
                description="Atualizar registro metrológico no assistente passo a passo"
            />

            <Alert variant="default" className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Modo de Edição</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                    Você está editando um registro existente. As alterações serão rastreadas nos logs de auditoria conforme exigência ISO/IEC 17025.
                </AlertDescription>
            </Alert>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <CalibrationWizardForm initialData={calibration as any} />
            </div>
        </div>
    )
}
