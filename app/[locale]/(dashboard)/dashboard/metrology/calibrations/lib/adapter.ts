import { Calibration, calibrationSchema } from "./schema"

export function calibrationAdapter(data: any): Calibration {
    const resultMap: Record<string, 'pass' | 'fail' | 'conditional_pass'> = {
        'approved': 'pass',
        'rejected': 'fail',
        'approved_with_restrictions': 'conditional_pass',
    }

    // Backend returns 'status_key' for logic (e.g. 'approved')
    // And 'result' for label (e.g. 'Aprovado')
    const key = data.status_key;
    const result = resultMap[key] || 'unknown'
    const parseDate = (dateStr?: string) => {
        if (!dateStr || dateStr === 'N/A') return null
        const parts = dateStr.split('/')
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`
        }
        return dateStr
    }

    try {
        return calibrationSchema.parse({
            id: data.id,
            // Backend now returns polymorphic fields
            instrument_id: data.calibrated_item_id || null,
            instrument_name: data.calibrated_item_name || "N/A",

            checklist_id: data.checklist_id !== 'N/A' ? data.checklist_id : null,

            // Map fields
            date: parseDate(data.calibration_date),
            calibration_date: parseDate(data.calibration_date),
            next_due_date: parseDate(data.next_calibration_due),
            technician: data.performed_by,

            result: result,
            result_label: data.result, // "Aprovado"

            deviation: data.deviation,
            uncertainty: data.uncertainty,
            notes: data.notes,
            certificate_url: data.certificate_url
        })
    } catch (error) {
        console.error("Zod Validation Error for ID " + data.id, error)
        throw error
    }
}
