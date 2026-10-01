import { z } from "zod"

export const instrumentSchema = z.object({
    id: z.string(),
    name: z.string(),
    serial_number: z.string().nullable().optional().transform(v => v || "N/A"),
    manufacturer: z.string().nullable().optional().transform(v => v || "Unknown"),
    model: z.string().nullable().optional().transform(v => v || "N/A"),
    type: z.string().nullable().optional(),
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
    instrument_type_id: z.string().nullable().optional(), // Changed to string for ULID
    location: z.string().nullable().optional().transform(v => v || "Unassigned"),
    range: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    material_id: z.string().nullable().optional(), // Changed to string for ULID
    criticality: z.string().nullable().optional().default('operational_reference'),
    criticality_label: z.string().nullable().optional(),
    is_critical: z.boolean().nullable().optional().default(false),
    open_non_conformity: z.any().nullable().optional(), // Relaxed validation to prevent crashes
    nfc_tag: z.string().nullable().optional(),
    precision: z.string().nullable().optional(),
    mpe: z.string().nullable().optional(),
    station_id: z.union([z.string(), z.number()]).nullable().optional(),
    station: z.any().nullable().optional(),
    calibrations: z.array(z.any()).nullable().optional().default([]),
    attachments: z.array(z.any()).nullable().optional().default([]),
}).passthrough()

export type Instrument = z.infer<typeof instrumentSchema>

export type InstrumentStatus = 'active' | 'expired' | 'in_calibration' | 'rejected' | 'inactive' | 'due' | 'calibrating' | 'lost';

export type InstrumentCriticality = 
    | 'safety_nr12' 
    | 'safety_nr13' 
    | 'product_quality_ctq' 
    | 'environmental' 
    | 'operational_reference';

export const CRITICALITY_LABELS: Record<string, string> = {
    safety_nr12: 'Segurança de Máquinas (NR-12)',
    safety_nr13: 'Vasos de Pressão / Caldeiras (NR-13)',
    product_quality_ctq: 'Crítico para Qualidade (CTQ / IATF)',
    environmental: 'Meio Ambiente (ISO 14001)',
    operational_reference: 'Operacional / Referência',
};

export const CRITICALITY_BADGE_VARIANTS: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    safety_nr12: 'destructive',
    safety_nr13: 'destructive',
    product_quality_ctq: 'secondary',
    environmental: 'outline',
    operational_reference: 'outline',
};

