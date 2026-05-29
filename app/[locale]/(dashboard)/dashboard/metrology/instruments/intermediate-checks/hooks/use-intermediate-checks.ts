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
            // Optional: Invalidate instrument details if status changes
            queryClient.invalidateQueries({ queryKey: ['instruments'] })
        }
    })
}
