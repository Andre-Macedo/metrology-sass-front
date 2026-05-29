import { z } from "zod"

export const intermediateCheckSchema = z.object({
    id: z.string().optional(),
    instrument_id: z.number().min(1, "Instrument ID is required"),
    check_date: z.string().min(1, "Date is required"),
    result: z.enum(['passed', 'failed']),
    reference_standard_id: z.coerce.number().optional().nullable(),
    performed_by: z.number().optional(),
    temperature: z.coerce.number().optional().nullable(),
    humidity: z.coerce.number().optional().nullable(),
    notes: z.string().optional().nullable(),

    // Read-only fields from API
    performed_by_name: z.string().optional(),
    reference_standard_name: z.string().optional().nullable(),
    created_at: z.string().optional(),
})

export type IntermediateCheck = z.infer<typeof intermediateCheckSchema>

export const intermediateCheckFormSchema = intermediateCheckSchema.omit({
    id: true,
    performed_by: true,
    performed_by_name: true,
    reference_standard_name: true,
    created_at: true,
})
