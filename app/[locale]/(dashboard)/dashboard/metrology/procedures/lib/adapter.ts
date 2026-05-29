import { ChecklistTemplate, checklistTemplateSchema } from "./schema"

export function checklistTemplateAdapter(data: any): ChecklistTemplate {
    // Adapter logic: Normalize types if backend sends strings for numbers
    if (data.items) {
        data.items = data.items.map((item: any) => ({
            ...item,
            nominal_value: item.nominal_value ? Number(item.nominal_value) : 0,
            required_readings: Number(item.required_readings) || 1,
            criteria: item.criteria ? Number(item.criteria) : 0,
            question_type: item.question_type || 'numeric'
        }))
    }

    try {
        return checklistTemplateSchema.parse(data)
    } catch (error) {
        console.error("Zod Validation Failed for Template:", data.name, error)
        console.log("Raw Data:", data)
        // Return a fallback or rethrow depending on strategy. 
        // For debugging purposes, rethrowing is better to see the error, 
        // but to prevent white screen, maybe return partial? 
        // User asked to 'fix', so likely wants it to work.
        // Let's rely on the logs to debug, but for now we might need to relax schema if we can't see the logs live.
        throw error
    }
}
