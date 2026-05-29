'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useLegal() {
    const queryClient = useQueryClient()

    const acceptMutation = useMutation({
        mutationFn: async () => {
            return await apiClient.post('/system/profile/accept-legal', {})
        },
        onSuccess: () => {
            // Atualiza o perfil do usuário para refletir o aceite
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
        },
    })

    return {
        accept: acceptMutation.mutate,
        isAccepting: acceptMutation.isPending,
    }
}
