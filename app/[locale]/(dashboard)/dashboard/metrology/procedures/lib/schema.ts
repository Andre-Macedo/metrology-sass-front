import { z } from "zod"

export const checklistItemSchema = z.object({
    id: z.string().optional(),
    step: z.string().min(1, "Step description is required"),
    question_type: z.enum(['numeric', 'boolean', 'text']),
    nominal_value: z.number().optional().default(0), // Changed to number for API
    required_readings: z.number().min(1).default(1),
    order: z.number().optional(),
    criteria: z.number().optional(), // Tolerance
})

export const checklistTemplateSchema = z.object({
    id: z.coerce.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    instrument_type_id: z.coerce.number().optional().nullable(),
    instrument_type: z.string().optional().nullable(),
    items: z.array(checklistItemSchema).min(1, "At least one item is required"),
})

export type ChecklistTemplate = z.infer<typeof checklistTemplateSchema>
export type ChecklistItem = z.infer<typeof checklistItemSchema>
