import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { NonConformity } from '../types'

export const NON_CONFORMITY_KEYS = {
    all: ['non-conformities'] as const,
    lists: () => [...NON_CONFORMITY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...NON_CONFORMITY_KEYS.lists(), { filters }] as const,
    details: () => [...NON_CONFORMITY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...NON_CONFORMITY_KEYS.details(), id] as const,
}

interface FetchParams {
    page?: number
    search?: string
    status?: string
    per_page?: number
}

export function useNonConformities(params: FetchParams = {}) {
    const { page = 1, search = '', status = '', per_page = 20 } = params
    
    return useQuery({
        queryKey: NON_CONFORMITY_KEYS.list(JSON.stringify(params)),
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                per_page: per_page.toString()
            })
            if (search) queryParams.append('search', search)
            if (status && status !== 'all') queryParams.append('status', status)
                
            return await apiClient.get<{ data: NonConformity[]; current_page: number; last_page: number; total: number }>(
                `/metrology/non-conformities?${queryParams.toString()}`
            )
        },
    })
}

export function useNonConformity(id: string) {
    return useQuery({
        queryKey: NON_CONFORMITY_KEYS.detail(id),
        queryFn: async () => {
            const res = await apiClient.get<{ data: NonConformity }>(`/metrology/non-conformities/${id}`)
            return (res as any).data || res
        },
        enabled: !!id,
    })
}

export function useUpdateNonConformity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NonConformity> }) => 
            apiClient.put(`/metrology/non-conformities/${id}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: NON_CONFORMITY_KEYS.lists() })
            queryClient.invalidateQueries({ queryKey: NON_CONFORMITY_KEYS.detail(variables.id) })
        },
    })
}

export function useCloseNonConformity() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, resolution }: { id: string; resolution: string }) => 
            apiClient.post(`/metrology/non-conformities/${id}/close`, { resolution }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: NON_CONFORMITY_KEYS.lists() })
            queryClient.invalidateQueries({ queryKey: NON_CONFORMITY_KEYS.detail(variables.id) })
        },
    })
}
