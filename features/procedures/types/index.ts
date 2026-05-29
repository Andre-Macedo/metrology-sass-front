import { z } from "zod"

export const checklistItemSchema = z.object({
    id: z.string().optional(),
    step: z.string().min(1),
    question_type: z.enum(['numeric', 'boolean', 'text']),
    nominal_value: z.number().optional().default(0),
    required_readings: z.number().min(1).default(1),
    order: z.number().optional(),
    criteria: z.number().optional(),
})

export const checklistTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(2),
    instrument_type_id: z.coerce.number().optional().nullable(),
    items: z.array(checklistItemSchema).min(1),
})

export type ChecklistTemplate = z.infer<typeof checklistTemplateSchema>
export type ChecklistItem = z.infer<typeof checklistItemSchema>
