import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useUploadAttachment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ file, attachable_type, attachable_id }: { file: File, attachable_type: string, attachable_id: number | string }) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('attachable_type', attachable_type)
            formData.append('attachable_id', attachable_id.toString())

            return await apiClient.upload<{ data: any }>('/metrology/attachments', formData)
        },
        onSuccess: (_, variables) => {
            // Invalidate the entity's query to refresh its attachments list
            // Depending on the attachable_type, we invalidate different keys
            if (variables.attachable_type.includes('Instrument')) {
                queryClient.invalidateQueries({ queryKey: ['instruments', variables.attachable_id.toString()] })
            } else if (variables.attachable_type.includes('ReferenceStandard')) {
                queryClient.invalidateQueries({ queryKey: ['standards', variables.attachable_id.toString()] })
            }
        },
    })
}

export function useDeleteAttachment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, attachable_type, attachable_id }: { id: number | string, attachable_type: string, attachable_id: number | string }) => {
            await apiClient.delete(`/metrology/attachments/${id}`)
        },
        onSuccess: (_, variables) => {
            if (variables.attachable_type.includes('Instrument')) {
                queryClient.invalidateQueries({ queryKey: ['instruments', variables.attachable_id.toString()] })
            } else if (variables.attachable_type.includes('ReferenceStandard')) {
                queryClient.invalidateQueries({ queryKey: ['standards', variables.attachable_id.toString()] })
            }
        },
    })
}
