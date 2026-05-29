import { apiClient } from "./client";

export interface ChecklistTemplate {
    id: string;
    name: string;
    version: number;
    is_active: boolean;
    revision_notes?: string;
    items: {
        id?: string;
        step: string;
        question_type: 'numeric' | 'boolean' | 'text';
        nominal_value?: number;
        required_readings?: number;
        criteria?: number; // Tolerance (not yet supported by backend)
        order?: number;
    }[];
}

export async function fetchChecklistTemplates(): Promise<ChecklistTemplate[]> {
    const response = await apiClient.get<{ data: ChecklistTemplate[] }>('/checklist-templates');
    return response.data;
}

export async function getChecklistTemplate(id: string): Promise<ChecklistTemplate | undefined> {
    try {
        const response = await apiClient.get<{ data: ChecklistTemplate }>(`/checklist-templates/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch template", error);
        return undefined;
    }
}

export async function createChecklistTemplate(data: Omit<ChecklistTemplate, 'id'>): Promise<ChecklistTemplate> {
    // Ensure items have IDs or order if missing? Backend expects order.
    // Frontend should provide it or we map it.
    const payload = {
        ...data,
        items: data.items.map((item, index) => ({
            ...item,
            order: item.order ?? index + 1
        }))
    };
    const response = await apiClient.post<{ data: ChecklistTemplate }>('/checklist-templates', payload);
    return response.data;
}

export async function updateChecklistTemplate(id: string, data: Partial<ChecklistTemplate>): Promise<ChecklistTemplate> {
    const response = await apiClient.put<{ data: ChecklistTemplate }>(`/checklist-templates/${id}`, data);
    return response.data;
}

export async function deleteChecklistTemplate(id: string): Promise<void> {
    await apiClient.delete(`/checklist-templates/${id}`);
}
