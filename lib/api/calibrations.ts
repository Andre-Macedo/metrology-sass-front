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

export async function fetchCertificates(): Promise<Certificate[]> {
    // Since backend has no dedicated certs endpoint yet, we fetch calibrations with certificates
    const calibrations = await fetchCalibrations();
    return calibrations
        .filter(c => c.certificate_url)
        .map(c => ({
            id: `CERT-${c.id}`, // Mock Cert ID structure if not provided
            calibration_id: c.id,
            instrument_name: c.instrument_name,
            issue_date: c.date,
            hash: 'N/A', // Missing in resource
            pdf_url: c.certificate_url!,
            status: 'valid'
        }));
}

