import { Instrument } from "@/lib/types";
import { apiClient } from "./client";

export async function fetchInstruments(): Promise<Instrument[]> {
    const response = await apiClient.get<{ data: Instrument[] }>('/instruments');
    return response.data;
}

export async function getInstrument(id: string): Promise<Instrument | undefined> {
    try {
        const response = await apiClient.get<{ data: Instrument }>(`/instruments/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch instrument", error);
        return undefined;
    }
}

export async function createInstrument(data: Omit<Instrument, 'id'>): Promise<Instrument> {
    const response = await apiClient.post<{ data: Instrument }>('/instruments', data);
    return response.data;
}

export async function updateInstrument(id: string, data: Partial<Instrument>): Promise<Instrument> {
    const response = await apiClient.put<{ data: Instrument }>(`/instruments/${id}`, data);
    return response.data;
}

export async function deleteInstrument(id: string): Promise<void> {
    await apiClient.delete(`/instruments/${id}`);
}

