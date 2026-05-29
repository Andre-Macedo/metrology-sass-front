import { z } from "zod"

export const instrumentSchema = z.object({
    id: z.string(),
    name: z.string(),
    serial_number: z.string().nullable().optional().transform(v => v || "N/A"),
    manufacturer: z.string().nullable().optional().transform(v => v || "Unknown"),
    model: z.string().nullable().optional().transform(v => v || "N/A"),
    type: z.string().nullable().optional(),
    // Aligning with backend: active, inactive, maintenance, calibrating, lost
    // Plus frontend-only computed statuses: due, expired, in_calibration
    status: z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('maintenance'),
        z.literal('calibrating'),
        z.literal('lost'),
        z.literal('due'),
        z.literal('expired'),
        z.literal('in_calibration'),
        z.literal('rejected'),
        z.string() // Fallback for unknown statuses
    ]).default('active'),
    last_calibration_date: z.string().nullable().optional().transform(v => v || ""),
    next_calibration_date: z.string().nullable().optional().transform(v => v || ""),
    calibration_frequency: z.number().nullable().optional().default(12),
    location: z.string().nullable().optional().transform(v => v || "Unassigned"),
    station_id: z.number().nullable().optional(),
    range: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    material_id: z.number().nullable().optional(),
    open_non_conformity: z.object({
        id: z.number(),
        status: z.string(),
        title: z.string()
    }).nullable().optional(),
    calibrations: z.array(z.any()).optional().default([]),
    attachments: z.array(z.any()).optional().default([]),
})

export type Instrument = z.infer<typeof instrumentSchema>
