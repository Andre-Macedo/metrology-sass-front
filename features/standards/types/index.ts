import { z } from "zod"

export const standardSchema = z.object({
    id: z.coerce.string(),
    name: z.string().min(1),
    serial_number: z.coerce.string().nullable().optional().transform(v => v || "N/A"),
    effective_serial_number: z.string().nullable().optional(),
    stock_number: z.string().nullable().optional(),
    type: z.string().nullable().optional().transform(v => v || "other"),
    type_id: z.union([z.string(), z.number()]).optional().nullable(),
    nominal_value: z.coerce.string().nullable().optional().transform(v => v || ""),
    actual_value: z.coerce.string().nullable().optional(),
    unit: z.string().nullable().optional(),
    uncertainty: z.coerce.string().nullable().optional(),
    status: z.string().nullable().optional(),
    manufacturer: z.string().nullable().optional(),
    certificate_number: z.string().nullable().optional(),
    accredited_lab: z.string().nullable().optional(),
    traceability_chain: z.string().nullable().optional(),
    certificate_url: z.string().nullable().optional(),
    last_calibration_date: z.string().nullable().optional(),
    next_calibration_date: z.string().nullable().optional(),
    material_id: z.union([z.string(), z.number()]).nullable().optional(),
    parent_id: z.coerce.string().nullable().optional(),
    parent: z.any().optional(),
    children: z.array(z.any()).optional(),
    open_non_conformity: z.object({
        id: z.union([z.string(), z.number()]),
        status: z.string(),
        title: z.string()
    }).nullable().optional(),
}).passthrough()

export type ReferenceStandard = z.infer<typeof standardSchema> & {
    children?: ReferenceStandard[]
    parent?: ReferenceStandard
}
