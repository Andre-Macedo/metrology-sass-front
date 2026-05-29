import { client } from "./client"

export interface NonConformity {
    id: number
    item_type: string
    item_id: number
    calibration_id: number
    user_id: number
    status: 'open' | 'investigating' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    root_cause_analysis?: string
    immediate_action?: string
    corrective_action?: string
    preventive_action?: string
    created_at: string
    updated_at: string
    closed_at?: string
    item?: {
        id: number
        name: string
        serial_number: string
    }
    opener?: {
        id: number
        name: string
    }
}

export async function fetchNonConformities(params?: { page?: number, status?: string }): Promise<{ data: NonConformity[], meta: any }> {
    const { data } = await client.get("/non-conformities", params)
    return data
}

export async function fetchNonConformity(id: string): Promise<NonConformity> {
    const { data } = await client.get(`/non-conformities/${id}`)
    return data
}

export async function updateNonConformity(id: string, payload: Partial<NonConformity>): Promise<NonConformity> {
    const { data } = await client.put(`/non-conformities/${id}`, payload)
    return data
}

export async function closeNonConformity(id: string): Promise<NonConformity> {
    const { data } = await client.post(`/non-conformities/${id}/close`)
    return data
}
