import { Calibration, calibrationSchema } from "../types"

export function calibrationAdapter(data: any): Calibration {
    const resultMap: Record<string, 'pass' | 'fail' | 'conditional' | 'approved_with_restrictions'> = {
        'approved': 'pass',
        'rejected': 'fail',
        'conditional': 'conditional',
        'approved_with_restrictions': 'approved_with_restrictions',
    }

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
            instrument_id: data.calibrated_item_id || null,
            instrument_name: data.calibrated_item_name || "N/A",
            checklist_id: data.checklist_id !== 'N/A' ? data.checklist_id : null,
            date: parseDate(data.calibration_date),
            calibration_date: parseDate(data.calibration_date),
            next_due_date: parseDate(data.next_calibration_due),
            technician: data.performed_by,
            result: result,
            result_label: data.result,
            as_found_result: data.as_found_result,
            as_left_result: data.as_left_result,
            deviation: data.deviation,
            as_found_deviation: data.as_found_deviation,
            as_left_deviation: data.as_left_deviation,
            uncertainty: data.uncertainty,
            notes: data.notes,
            certificate_url: data.certificate_url,
            status: data.status,
            calibrated_item_id: data.calibrated_item_id,
            calibrated_item_name: data.calibrated_item_name,
        })
    } catch (error) {
        console.error("Zod Validation Error for ID " + data.id, error)
        throw error
    }
}
