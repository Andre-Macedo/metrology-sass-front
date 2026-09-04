import { z } from "zod"

// Instrument Type Schema
export const instrumentTypeSchema = z.object({
    id: z.string().optional().or(z.number().optional()),
    name: z.string().min(1, "Name is required"),
    calibration_frequency_months: z.coerce.number().min(1, "Frequency must be at least 1 month").default(12).optional(),
    decision_rule: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
}).passthrough()

export type InstrumentType = z.infer<typeof instrumentTypeSchema>

// Reference Standard Type Schema
export const referenceStandardTypeSchema = z.object({
    id: z.string().optional().or(z.number().optional()),
    name: z.string().min(1, "Name is required"),
    calibration_frequency_months: z.coerce.number().min(1, "Frequency must be at least 1 month").default(24).optional(),
    description: z.string().optional().nullable(),
}).passthrough()

export type ReferenceStandardType = z.infer<typeof referenceStandardTypeSchema>

// Material Schema (Thermal Expansion)
export const materialSchema = z.object({
    id: z.string().optional().or(z.number().optional()),
    name: z.string().min(1, "Name is required"),
    cte: z.coerce.number().optional().nullable(), // Coefficient of Thermal Expansion
    category: z.string().optional().nullable(),
}).passthrough()

export type Material = z.infer<typeof materialSchema>
