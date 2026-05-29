"use client"

import { CalibrationWizardForm } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/components/calibration-wizard"
import { PageHeader } from "@/components/layout/page-header"

export default function CreateCalibrationPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Record New Calibration"
                description="Follow the wizard to execute and record a calibration"
            />
            <CalibrationWizardForm />
        </div>
    )
}
