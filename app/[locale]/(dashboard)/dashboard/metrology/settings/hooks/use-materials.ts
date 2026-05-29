import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Material } from '../lib/schema'

export const MATERIAL_KEYS = {
    all: ['metrology', 'materials'] as const,
    lists: () => [...MATERIAL_KEYS.all, 'list'] as const,
}

export function useMaterials() {
    return useQuery({
        queryKey: MATERIAL_KEYS.lists(),
        queryFn: async () => {
            const response = await apiClient.get<{ data: Material[] }>('/metrology/materials')
            return response.data || []
        },
    })
}

export function useCreateMaterial() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Material) => apiClient.post('/metrology/materials', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.lists() }),
    })
}

export function useUpdateMaterial() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Material> }) => 
            apiClient.put(`/metrology/materials/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.lists() }),
    })
}

export function useDeleteMaterial() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/metrology/materials/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.lists() }),
    })
}
