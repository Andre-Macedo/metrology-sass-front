import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { checklistTemplateAdapter } from '../utils/adapters'
import { ChecklistTemplate } from '../types'

/**
 * Fetches all checklist templates (procedures).
 */
export function useProcedures() {
    return useQuery({
        queryKey: ['procedures'],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any[] }>('/checklist-templates')
            return response.data.map(checklistTemplateAdapter)
        }
    })
}

/**
 * Fetches a single procedure by ID.
 */
export function useProcedure(id: string) {
    return useQuery({
        queryKey: ['procedures', id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: any }>(`/checklist-templates/${id}`)
            return checklistTemplateAdapter(response.data)
        },
        enabled: !!id
    })
}

/**
 * Deletes a procedure.
 */
export function useDeleteProcedure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/checklist-templates/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['procedures'] })
        }
    })
}

/**
 * Creates a new procedure.
 */
export function useCreateProcedure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post<{ data: any }>('/checklist-templates', data)
            return checklistTemplateAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['procedures'] })
        }
    })
}

/**
 * Updates an exisiting procedure.
 */
export function useUpdateProcedure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const response = await apiClient.put<{ data: any }>(`/checklist-templates/${id}`, data)
            return checklistTemplateAdapter(response.data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['procedures'] })
        }
    })
}
