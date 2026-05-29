import { apiClient } from "./client";

export interface ReferenceStandard {
    id: string;
    name: string;
    serial_number: string;
    type: string; // Updated to string to support backend types
    type_id?: number; // Added for backend compatibility
    nominal_value?: string;
}

export async function fetchStandards(): Promise<ReferenceStandard[]> {
    const response = await apiClient.get<{ data: ReferenceStandard[] }>('/standards');
    return response.data;
}

export async function getStandard(id: string): Promise<ReferenceStandard | undefined> {
    try {
        const response = await apiClient.get<{ data: ReferenceStandard }>(`/standards/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch standard", error);
        return undefined;
    }
}

export async function createStandard(data: Omit<ReferenceStandard, 'id'>): Promise<ReferenceStandard> {
    const response = await apiClient.post<{ data: ReferenceStandard }>('/standards', data);
    return response.data;
}

export async function updateStandard(id: string, data: Partial<ReferenceStandard>): Promise<ReferenceStandard> {
    const response = await apiClient.put<{ data: ReferenceStandard }>(`/standards/${id}`, data);
    return response.data;
}

export async function deleteStandard(id: string): Promise<void> {
    await apiClient.delete(`/standards/${id}`);
}

