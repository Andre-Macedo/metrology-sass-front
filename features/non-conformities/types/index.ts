import { z } from "zod"

export const nonConformitySchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    status: z.enum(['open', 'investigating', 'resolved', 'closed']).default('open'),
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    
    // Analysis and Actions
    root_cause_analysis: z.string().optional().nullable(),
    immediate_action: z.string().optional().nullable(),
    corrective_action: z.string().optional().nullable(),
    preventive_action: z.string().optional().nullable(),
    
    // Item Identity
    item_id: z.string(),
    item_type: z.string(),
    item_name: z.string().optional().nullable(),
    
    // Dates
    opened_at: z.string(),
    closed_at: z.string().optional().nullable(),
    
    // Personnel
    opened_by: z.string().optional().nullable(),
    closed_by: z.string().optional().nullable(),
    
    // Relationships
    calibration_id: z.number().optional().nullable(),
})

export type NonConformity = z.infer<typeof nonConformitySchema>

export type NonConformityStatus = NonConformity['status']
export type NonConformitySeverity = NonConformity['severity']
