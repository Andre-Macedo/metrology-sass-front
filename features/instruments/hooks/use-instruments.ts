import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { instrumentAdapter } from '../utils/adapters'
import { Instrument } from '../types'
import { Material } from '@/lib/types'

/**
 * Fetches all instruments with pagination and filters.
 */
export function useInstruments(params?: { page?: number, per_page?: number, search?: string, status?: string, station_id?: string | number }) {
    return useQuery({
        queryKey: ['instruments', params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {}
            if (params?.page) queryParams.page = params.page.toString()
            if (params?.per_page) queryParams.per_page = params.per_page.toString()
            if (params?.search) queryParams.search = params.search
            if (params?.status && params.status !== 'all') queryParams.status = params.status
            if (params?.station_id) queryParams.station_id = params.station_id.toString()

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
 */
export function useDriftData(instrumentId: string, nominalValue?: string) {
    return useQuery({
        queryKey: ['drift', instrumentId, nominalValue],
        queryFn: async () => {
            const params: Record<string, string> = {}
            if (nominalValue) params.nominal_value = nominalValue
            const response = await apiClient.get<any>(`/instruments/${instrumentId}/drift`, params)
            return response
        },
        enabled: !!instrumentId
    })
}

/**
 * Deletes an instrument.
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
 */
export function useUpdateInstrument() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
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
            const response = await apiClient.get<{ data: any }>(`/instruments/${instrumentId}/interval-recommendation`)
            return response.data
        },
        enabled: !!instrumentId
    })
}

/**
 * Fetches materials for thermal correction
 */
export function useMaterials() {
    return useQuery({
        queryKey: ['materials'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: Material[] }>('/materials')
            return response.data
        }
    })
}
