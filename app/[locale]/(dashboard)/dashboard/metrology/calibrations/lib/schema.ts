import { z } from "zod"

export const calibrationSchema = z.object({
    id: z.string(),
    instrument_id: z.string().nullable().optional(),
    instrument_name: z.string().nullable().optional().default("N/A"),
    checklist_id: z.string().nullable().optional(),

    date: z.string().nullable(),
    calibration_date: z.string().nullable().optional(),

    next_due_date: z.string().nullable(),
    technician: z.string().default("Sistema"),

    result: z.enum(['pass', 'fail', 'conditional_pass', 'unknown']),
    result_label: z.string().nullable().optional(),

    // Technical details
    deviation: z.coerce.number().nullable().optional(),
    uncertainty: z.coerce.number().nullable().optional(),
    temperature: z.coerce.number().nullable().optional(), // Added
    humidity: z.coerce.number().nullable().optional(), // Added
    notes: z.string().nullable().optional(),

    // Wizard Specific
    checklist_template_id: z.string().nullable().optional(),
    checklist_items: z.array(z.any()).optional().default([]), // Using any for complex nested objects for now

    certificate_url: z.string().nullable().optional(),
})

export type Calibration = z.infer<typeof calibrationSchema>
