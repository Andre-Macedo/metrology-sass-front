import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { calibrationAdapter } from '@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/lib/adapter'
import { Calibration } from '@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/lib/schema'

/**
 * Fetches all calibration records.
 * @returns React Query result with list of calibrations.
 */
export function useCalibrations(params?: { page?: number, per_page?: number, search?: string, status?: string, type?: string }) {
    return useQuery({
        queryKey: ['calibrations', params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {}
            if (params?.page) queryParams.page = params.page.toString()
            if (params?.per_page) queryParams.per_page = params.per_page.toString()
            if (params?.search) queryParams.search = params.search
            if (params?.status && params.status !== 'all') queryParams.status = params.status
            // Use 'scope' or 'calibrated_item_type' depending on backend. Using 'type' as generic param mapping to likely backend implementation
            if (params?.type) queryParams.calibrated_item_type = params.type

            const response = await apiClient.get<{ data: any[], meta: any, links: any }>('/calibrations', queryParams)

            // Handle cases where API returns just array (backward compatibility or different response structure)
            if (Array.isArray(response)) {
                return {
                    data: response.map(calibrationAdapter),
                    meta: { total: response.length, current_page: 1, last_page: 1 },
                    links: {}
                }
            }

            // Handle { data: [...] } format
            const list = Array.isArray(response.data) ? response.data : []
            return {
                data: list.map(calibrationAdapter),
                meta: response.meta || { total: list.length },
                links: response.links
            }
        }
    })
}

/**
 * Fetches a single calibration by ID.
 * @param id - The calibration ID.
 */
export function useCalibration(id: string) {
    return useQuery({
        queryKey: ['calibrations', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>(`/calibrations/${id}`)
            return calibrationAdapter(response.data)
        },
        enabled: !!id
    })
}

/**
 * Creates a new calibration record.
 * Invalidates 'calibrations' query on success.
 */
export function useCreateCalibration() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{ data: any }>('/metrology/calibrations', data)
            return calibrationAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calibrations'] })
        }
    })
}

/**
 * Deletes a calibration record.
 * Invalidates 'calibrations' query on success.
 */
export function useDeleteCalibration() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/calibrations/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calibrations'] })
        }
    })
}

/**
 * Updates an existing calibration record.
 * Invalidates 'calibrations' query on success.
 */
export function useUpdateCalibration() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            const response = await apiClient.put<{ data: any }>(`/metrology/calibrations/${id}`, data)
            return calibrationAdapter(response.data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['calibrations'] })
            queryClient.invalidateQueries({ queryKey: ['calibrations', variables.id] })
        }
    })
}

/**
 * Calculates uncertainty without saving.
 */
export function useCalculateUncertainty() {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{
                uncertainty: number,
                k_factor: number,
                uncertainty_budget: any[]
            }>('/calibrations/calculate', data)
            return response // raw data
        }
    })
}

export function useApproveCalibration() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.post(`/calibrations/${id}/approve`)
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['calibrations'] })
            queryClient.invalidateQueries({ queryKey: ['calibrations', id] })
        }
    })
}

export function useRejectCalibration() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.post(`/calibrations/${id}/reject`)
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['calibrations'] })
            queryClient.invalidateQueries({ queryKey: ['calibrations', id] })
        }
    })
}

export function useTraceabilityChain(id: string) {
    return useQuery({
        queryKey: ['calibrations', id, 'traceability'],
        queryFn: async () => {
            const response = await apiClient.get<{ nodes: any[], edges: any[] }>(`/calibrations/${id}/traceability-chain`)
            return response
        },
        enabled: !!id
    })
}
