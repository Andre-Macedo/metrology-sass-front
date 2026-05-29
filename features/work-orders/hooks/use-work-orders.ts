import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { WorkOrder, WorkOrderFormData } from '../types'

export const WORK_ORDER_KEYS = {
    all: ['work-orders'] as const,
    lists: () => [...WORK_ORDER_KEYS.all, 'list'] as const,
    list: (filters: string) => [...WORK_ORDER_KEYS.lists(), { filters }] as const,
    details: () => [...WORK_ORDER_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...WORK_ORDER_KEYS.details(), id] as const,
}

interface FetchParams {
    page?: number
    search?: string
    status?: string
    per_page?: number
}

export function useWorkOrders(params: FetchParams = {}) {
    const { page = 1, search = '', status = '', per_page = 20 } = params
    
    return useQuery({
        queryKey: WORK_ORDER_KEYS.list(JSON.stringify(params)),
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                per_page: per_page.toString()
            })
            if (search) queryParams.append('search', search)
            if (status && status !== 'all') queryParams.append('status', status)
                
            return await apiClient.get<{ data: WorkOrder[]; current_page: number; last_page: number; total: number }>(
                `/metrology/work-orders?${queryParams.toString()}`
            )
        },
    })
}

export function useWorkOrder(id: string) {
    return useQuery({
        queryKey: WORK_ORDER_KEYS.detail(id),
        queryFn: async () => {
            const res = await apiClient.get<{ data: WorkOrder }>(`/metrology/work-orders/${id}`)
            return (res as any).data || res
        },
        enabled: !!id,
    })
}

export function useCreateWorkOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: WorkOrderFormData) => apiClient.post(`/metrology/work-orders`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.lists() })
        },
    })
}

export function useUpdateWorkOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrderFormData> }) => 
            apiClient.put(`/metrology/work-orders/${id}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.lists() })
            queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.detail(variables.id) })
        },
    })
}

export function useDeleteWorkOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/metrology/work-orders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.lists() })
        },
    })
}
