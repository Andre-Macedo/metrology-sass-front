import { z } from "zod"

export const auditLogSchema = z.object({
    id: z.string(),
    event: z.string(), // created, updated
    user_name: z.string(),
    created_at: z.string(),
    formatted_date: z.string(),
    old_values: z.record(z.any()).nullable(),
    new_values: z.record(z.any()).nullable(),
    url: z.string().nullable(),
})

export type AuditLog = z.infer<typeof auditLogSchema>
