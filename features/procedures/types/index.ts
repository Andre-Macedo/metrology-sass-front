import { z } from "zod"

export const checklistItemSchema = z.object({
    id: z.string().optional(),
    step: z.string().min(1),
    question_type: z.enum(['numeric', 'boolean', 'text']),
    nominal_value: z.number().optional().default(0),
    required_readings: z.number().min(0).default(0),
    order: z.number().optional(),
    criteria: z.number().optional().nullable(),
}).passthrough()

export const checklistTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(2),
    instrument_type_id: z.string().optional().nullable(),
    items: z.array(checklistItemSchema).min(1),
}).passthrough()

export type ChecklistTemplate = z.infer<typeof checklistTemplateSchema>
export type ChecklistItem = z.infer<typeof checklistItemSchema>
