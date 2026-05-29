'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi } from '@/lib/api/support'

export function useSupport() {
    const queryClient = useQueryClient()

    const ticketsQuery = useQuery({
        queryKey: ['support', 'tickets'],
        queryFn: supportApi.list,
    })

    const createTicketMutation = useMutation({
        mutationFn: supportApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] })
        },
    })

    return {
        tickets: ticketsQuery.data || [],
        isLoading: ticketsQuery.isLoading,
        createTicket: createTicketMutation.mutate,
        isCreating: createTicketMutation.isPending,
    }
}

export function useTicket(id: string) {
    const queryClient = useQueryClient()

    const ticketQuery = useQuery({
        queryKey: ['support', 'tickets', id],
        queryFn: () => supportApi.get(id),
        enabled: !!id,
    })

    const addMessageMutation = useMutation({
        mutationFn: (message: string) => supportApi.addMessage(id, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets', id] })
        },
    })

    return {
        ticket: ticketQuery.data,
        isLoading: ticketQuery.isLoading,
        addMessage: addMessageMutation.mutate,
        isAddingMessage: addMessageMutation.isPending,
    }
}
