import { z } from "zod"

export const accessLogSchema = z.object({
    id: z.number(),
    user_id: z.number(),
    user_name: z.string().optional().nullable(),
    station_id: z.number(),
    station_name: z.string().optional().nullable(),
    instrument_id: z.number().optional().nullable(),
    instrument_name: z.string().optional().nullable(),
    action: z.string(),
    created_at: z.string(),
})

export type AccessLog = z.infer<typeof accessLogSchema>
