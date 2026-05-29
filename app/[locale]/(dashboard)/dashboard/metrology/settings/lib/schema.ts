import { z } from "zod"

// Instrument Type Schema
export const instrumentTypeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    calibration_frequency_months: z.coerce.number().min(1, "Frequency must be at least 1 month").default(12),
    decision_rule: z.string().optional(),
    description: z.string().optional().nullable(),
})

export type InstrumentType = z.infer<typeof instrumentTypeSchema>


// Reference Standard Type Schema
export const referenceStandardTypeSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    calibration_frequency_months: z.coerce.number().min(1, "Frequency must be at least 1 month").default(24),
    description: z.string().optional().nullable(),
})

export type ReferenceStandardType = z.infer<typeof referenceStandardTypeSchema>

// Material Schema (Thermal Expansion)
export const materialSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    cte: z.coerce.number().optional().nullable(), // Coefficient of Thermal Expansion
    category: z.string().optional().nullable(),
})

export type Material = z.infer<typeof materialSchema>
