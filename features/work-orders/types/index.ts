import { z } from "zod"

export const workOrderSchema = z.object({
    id: z.string(),
    number: z.string(),
    status: z.string(),
    item_id: z.string(),
    item_type: z.string(),
    item: z.object({
        id: z.string(),
        name: z.string(),
        serial_number: z.string(),
    }).nullable().optional(),
    origin_station_id: z.string().nullable().optional(),
    origin_station_name: z.string().nullable().optional(),
    destination_station_id: z.string().nullable().optional(),
    destination_station_name: z.string().nullable().optional(),
    courier_name: z.string().nullable().optional(),
    visual_inspection_notes: z.string().nullable().optional(),
    customer_notes: z.string().nullable().optional(),
    expected_return_date: z.string().nullable().optional(),
    received_by_id: z.string().nullable().optional(),
    received_by_name: z.string().nullable().optional(),
    created_at: z.string(),
})

export type WorkOrder = z.infer<typeof workOrderSchema>

export const workOrderFormDataSchema = z.object({
    item_id: z.string(),
    item_type: z.string().default('Modules\\Metrology\\Models\\Instrument'),
    visual_inspection_notes: z.string().optional(),
    customer_notes: z.string().optional(),
    expected_return_date: z.string().optional(),
    status: z.string().default('received'),
    origin_station_id: z.string().optional(),
    destination_station_id: z.string().optional(),
    courier_name: z.string().optional(),
})

export type WorkOrderFormData = z.infer<typeof workOrderFormDataSchema>
