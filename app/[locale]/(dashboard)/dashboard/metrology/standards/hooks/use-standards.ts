import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { standardAdapter } from '../lib/adapter'
import { ReferenceStandard } from '../lib/schema'

/**
 * Fetches all reference standards with pagination and search.
 * @returns React Query result with list of standards and metadata.
 */
export function useStandards(params?: { page?: number, per_page?: number, search?: string, type?: string }) {
    return useQuery({
        queryKey: ['standards', params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {}
            if (params?.page) queryParams.page = params.page.toString()
            if (params?.per_page) queryParams.per_page = params.per_page.toString()
            if (params?.search) queryParams.search = params.search
            if (params?.type && params.type !== 'all') queryParams.type = params.type

            const response = await apiClient.get<{ data: any[], meta: any, links: any }>('/standards', queryParams)

            return {
                data: response.data.map(standardAdapter),
                meta: response.meta,
                links: response.links
            }
        }
    })
}

/**
 * Fetches a single standard by ID.
 * @param id - The ID of the standard to fetch.
 */
export function useStandard(id: string) {
    return useQuery({
        queryKey: ['standards', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>(`/standards/${id}`)
            return standardAdapter(response.data)
        },
        enabled: !!id
    })
}

/**
 * Fetches impact analysis (calibrations performed using this standard).
 */
export function useStandardImpact(id: string, params?: { page?: number, start_date?: string, end_date?: string }) {
    return useQuery({
        queryKey: ['standards', id, 'impact', params],
        queryFn: async () => {
            const queryParams: Record<string, string> = {}
            if (params?.page) queryParams.page = params.page.toString()
            if (params?.start_date) queryParams.start_date = params.start_date
            if (params?.end_date) queryParams.end_date = params.end_date

            const response = await apiClient.get<{ data: any[], meta: any, links: any }>(`/standards/${id}/impact-analysis`, queryParams)
            return response
        },
        enabled: !!id
    })
}

/**
 * Deletes a standard by ID.
 * Invalidates 'standards' query on success.
 */
export function useDeleteStandard() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/standards/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['standards'] })
        }
    })
}

/**
 * Creates a new standard.
 * Invalidates 'standards' query on success.
 */
export function useCreateStandard() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{ data: any }>('/standards', data)
            return standardAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['standards'] })
        }
    })
}

/**
 * Updates an existing standard.
 * Invalidates 'standards' query on success.
 */
export function useUpdateStandard() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await apiClient.put<{ data: any }>(`/standards/${id}`, data)
            return standardAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['standards'] })
        }
    })
}
