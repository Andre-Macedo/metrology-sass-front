import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { instrumentAdapter } from '@/app/[locale]/(dashboard)/dashboard/metrology/instruments/lib/adapter'
import { Instrument } from '@/app/[locale]/(dashboard)/dashboard/metrology/instruments/lib/schema'

/**
 * Fetches all instruments with pagination and filters.
 * @returns React Query result with list of instruments and metadata.
 */
export function useInstruments(params?: { page?: number, per_page?: number, search?: string, status?: string }) {
    return useQuery({
        queryKey: ['instruments', params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {}
            if (params?.page) queryParams.page = params.page.toString()
            if (params?.per_page) queryParams.per_page = params.per_page.toString()
            if (params?.search) queryParams.search = params.search
            if (params?.status && params.status !== 'all') queryParams.status = params.status

            const response = await apiClient.get<{ data: any[], meta: any, links: any }>('/instruments', queryParams)

            return {
                data: response.data.map(instrumentAdapter),
                meta: response.meta,
                links: response.links
            }
        }
    })
}

/**
 * Fetches a single instrument by ID.
 * @param id - The instrument ID.
 */
export function useInstrument(id: string) {
    return useQuery({
        queryKey: ['instruments', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>(`/instruments/${id}`)
            return instrumentAdapter(response.data)
        },
        enabled: !!id
    })
}

/**
 * Fetches drift trend data for an instrument.
 * @param instrumentId - instrument ID
 * @param nominalValue - optional test point nominal value for micro view
 */
export function useDriftData(instrumentId: string, nominalValue?: string) {
    return useQuery({
        queryKey: ['drift', instrumentId, nominalValue],
        queryFn: async () => {
            const params: Record<string, string> = {}
            if (nominalValue) params.nominal_value = nominalValue

            // Backend returns { labels: [...], datasets: [...], available_points: [...] } matches frontend expectation
            const response = await apiClient.get<any>(`/instruments/${instrumentId}/drift`, params)
            return response
        },
        enabled: !!instrumentId
    })
}

/**
 * Deletes an instrument.
 * Invalidates 'instruments' query on success.
 */
export function useDeleteInstrument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/instruments/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] })
        }
    })
}

/**
 * Creates a new instrument.
 * Invalidates 'instruments' query on success.
 */
export function useCreateInstrument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{ data: any }>('/instruments', data)
            return instrumentAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] })
        }
    })
}

/**
 * Updates an exisiting instrument.
 * Invalidates 'instruments' and specific instrument query on success.
 */
export function useUpdateInstrument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            // Remove 'id' from payload if present to avoid conflicts
            const { id: _, ...payload } = data
            const response = await apiClient.put<{ data: any }>(`/instruments/${id}`, payload)
            return instrumentAdapter(response.data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['instruments'] })
            queryClient.invalidateQueries({ queryKey: ['instruments', variables.id] })
        }
    })
}

/**
 * Fetches proper calibration interval recommendation.
 */
export function useCalibrationRecommendation(instrumentId: string) {
    return useQuery({
        queryKey: ['recommendation', instrumentId],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>(`/instruments/${instrumentId}/recommendation`)
            return response.data
        },
        enabled: !!instrumentId
    })
}
