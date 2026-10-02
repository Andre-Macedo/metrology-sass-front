import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { IntermediateCheck, intermediateCheckSchema } from '../lib/schema'

/**
 * Adapter to transform API data to frontend model
 */
function adapter(data: any): IntermediateCheck {
    return intermediateCheckSchema.parse({
        ...data,
        // Ensure numeric fields are numbers
        reference_standard_id: data.reference_standard_id ? Number(data.reference_standard_id) : null,
        temperature: data.temperature ? Number(data.temperature) : null,
        humidity: data.humidity ? Number(data.humidity) : null,
        instrument_id: Number(data.instrument_id)
    })
}

/**
 * Fetches checks for a specific instrument
 */
export function useIntermediateChecks(instrumentId: string | number) {
    return useQuery({
        queryKey: ['intermediate-checks', instrumentId],
        queryFn: async () => {
            if (!instrumentId) return []
            const response = await apiClient.get<{ data: any[] }>(`/instruments/${instrumentId}/intermediate-checks`)
            return response.data.map(adapter)
        },
        enabled: !!instrumentId
    })
}

export interface ShewhartPoint {
    id: number
    check_date: string
    formatted_date: string
    nominal_value: number | null
    measured_value: number | null
    deviation: number | null
    result: string
    temperature: number | null
    humidity: number | null
    standard_name: string | null
    performer_name: string | null
    notes: string | null
    is_out_of_control: boolean
    out_of_control_reason: string | null
}

export interface ShewhartData {
    instrument_id: number
    instrument_name: string
    mpe: number | null
    total_checks: number
    has_sufficient_data: boolean
    statistics: {
        count: number
        mean: number
        std_dev: number
        ucl: number
        lcl: number
        uwl: number
        lwl: number
        usl: number | null
        lsl: number | null
    } | null
    in_control: boolean
    alerts: string[]
    points: ShewhartPoint[]
}

/**
 * Fetches Shewhart control chart statistical data for an instrument
 */
export function useShewhartChart(instrumentId: string | number) {
    return useQuery<ShewhartData>({
        queryKey: ['shewhart-chart', instrumentId],
        queryFn: async () => {
            if (!instrumentId) throw new Error("Instrument ID is required")
            return await apiClient.get<ShewhartData>(`/instruments/${instrumentId}/intermediate-checks/shewhart`)
        },
        enabled: !!instrumentId
    })
}

/**
 * Create a new check
 */
export function useCreateIntermediateCheck() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{ data: any }>('/intermediate-checks', data)
            return adapter(response.data)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['intermediate-checks', data.instrument_id] })
            queryClient.invalidateQueries({ queryKey: ['shewhart-chart', data.instrument_id] })
            queryClient.invalidateQueries({ queryKey: ['instruments'] })
        }
    })
}

