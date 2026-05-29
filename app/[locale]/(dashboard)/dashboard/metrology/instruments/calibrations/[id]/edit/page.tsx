"use client"

import { CalibrationWizardForm } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/components/calibration-wizard"
import { PageHeader } from "@/components/layout/page-header"
import { getCalibration } from "@/lib/api/calibrations"
import { Calibration } from "@/lib/types"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function EditCalibrationPage() {
    const params = useParams()
    const [calibration, setCalibration] = useState<Calibration | undefined>(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (params.id) {
                const data = await getCalibration(params.id as string)
                if (data) setCalibration(data)
                setLoading(false)
            }
        }
        load()
    }, [params.id])

    if (loading) return <div>Loading...</div>
    if (!calibration) return <div>Calibration not found</div>

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit Calibration ${calibration.id}`}
                description="Update calibration records via Wizard"
            />

            <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Editing Mode</AlertTitle>
                <AlertDescription className="text-blue-700">
                    You are editing an existing record. Some fields might be locked to preserve integrity.
                </AlertDescription>
            </Alert>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-1">
                <CalibrationWizardForm initialData={calibration} />
            </div>
        </div>
    )
}

