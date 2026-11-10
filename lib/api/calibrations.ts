import { Calibration, Certificate } from "@/lib/types";
import { apiClient } from "./client";

// Map frontend result to backend enum
const RESULT_MAP: Record<string, string> = {
    'pass': 'approved',
    'fail': 'rejected',
    'conditional_pass': 'approved_with_restrictions'
};

export async function fetchCalibrations(): Promise<Calibration[]> {
    const response = await apiClient.get<{ data: Calibration[] }>('/calibrations');
    return response.data;
}

export async function getCalibration(id: string): Promise<Calibration | undefined> {
    try {
        const response = await apiClient.get<{ data: Calibration }>(`/calibrations/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch calibration", error);
        return undefined;
    }
}

export async function createCalibration(data: Omit<Calibration, 'id'>): Promise<Calibration> {
    const payload = {
        instrument_id: data.instrument_id,
        checklist_template_id: data.checklist_template_id,
        calibration_date: data.date,
        result: RESULT_MAP[data.result] || data.result,
        environment: {
            temperature: data.temperature,
            humidity: data.humidity,
        },
        notes: data.notes,
        items: data.checklist_items?.map(item => ({
            item_id: item.template_item_id,
            readings: item.readings,
            result: item.result === 'pass' ? 'approved' : 'rejected'
        }))
    };

    const response = await apiClient.post<{ data: Calibration }>('/metrology/calibrations', payload);
    return response.data;
}

export async function updateCalibration(id: string, data: Partial<Calibration>): Promise<Calibration> {
    // Note: Backend might strictly restrict updates. Using patch/put to resource.
    const response = await apiClient.put<{ data: Calibration }>(`/calibrations/${id}`, data);
    return response.data;
}

export async function deleteCalibration(id: string): Promise<void> {
    await apiClient.delete(`/calibrations/${id}`);
}

export async function fetchCertificates(filter?: { type?: string }): Promise<Certificate[]> {
    const calibrations = await fetchCalibrations();
    return calibrations
        .filter(c => c.certificate_url)
        .filter(c => {
            if (!filter?.type) return true;
            if (filter.type === 'standard') {
                return (
                    (c as any).is_standard === true ||
                    (c as any).type === 'standard' ||
                    (c.instrument_name?.toLowerCase().includes('padrão') ?? false) ||
                    (c.instrument_name?.toLowerCase().includes('standard') ?? false)
                );
            }
            return (c as any).type === filter.type;
        })
        .map(c => ({
            id: `CERT-`,
            calibration_id: c.id,
            instrument_name: c.instrument_name,
            issue_date: c.date,
            hash: (c as any).certificate_hash ?? 'N/A',
            pdf_url: c.certificate_url!,
            status: 'valid'
        }));
}
