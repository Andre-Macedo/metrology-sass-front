import { z } from "zod"

export const auditLogSchema = z.object({
    id: z.string(),
    sequence_number: z.number().optional().nullable(),
    previous_hash: z.string().optional().nullable(),
    record_hash: z.string().optional().nullable(),
    event: z.string(), // created, updated, deleted
    user_name: z.string(),
    created_at: z.string(),
    formatted_date: z.string(),
    auditable_type: z.string().optional().nullable(),
    auditable_id: z.union([z.string(), z.number()]).optional().nullable(),
    old_values: z.record(z.any()).nullable(),
    new_values: z.record(z.any()).nullable(),
    url: z.string().nullable(),
})

export type AuditLog = z.infer<typeof auditLogSchema>
