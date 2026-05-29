import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useUploadAttachment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ file, attachable_type, attachable_id }: { file: File, attachable_type: string, attachable_id: number }) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('attachable_type', attachable_type)
            formData.append('attachable_id', attachable_id.toString())

            // Fetch natively to handle FormData correctly if apiClient wrapper doesn't support it directly
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/metrology/attachments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || 'Upload failed')
            }

            return await res.json()
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
        mutationFn: async ({ id, attachable_type, attachable_id }: { id: number, attachable_type: string, attachable_id: number }) => {
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
