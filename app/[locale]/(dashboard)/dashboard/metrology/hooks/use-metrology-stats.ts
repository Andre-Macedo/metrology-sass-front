import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export interface MetrologyStats {
    kpi: {
        total_instruments: number
        active_count: number
        overdue_count: number
        in_calibration_count: number
        compliance_rate: number
    }
    upcoming_due: Array<{
        id: number
        name: string
        serial_number: string
        calibration_due: string
        status: string
    }>
    recent_calibrations: Array<{
        id: number
        item_name: string
        result: string
        date: string
        certificate: string
    }>
}

export function useMetrologyStats() {
    return useQuery({
        queryKey: ["metrology-stats"],
        queryFn: async () => {
            const data = await apiClient.get<MetrologyStats>("/dashboard/stats")
            return data
        },
    })
}
