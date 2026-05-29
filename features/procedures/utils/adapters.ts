import { ChecklistTemplate, checklistTemplateSchema } from "../types"

export function checklistTemplateAdapter(data: any): ChecklistTemplate {
    if (data.items) {
        data.items = data.items.map((item: any) => ({
            ...item,
            nominal_value: item.nominal_value ? Number(item.nominal_value) : 0,
            required_readings: Number(item.required_readings) || 1,
            criteria: item.criteria ? Number(item.criteria) : 0,
            question_type: item.question_type || 'numeric'
        }))
    }

    return checklistTemplateSchema.parse(data)
}
