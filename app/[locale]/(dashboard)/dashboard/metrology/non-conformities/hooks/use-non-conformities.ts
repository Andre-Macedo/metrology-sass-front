import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchNonConformities, fetchNonConformity, updateNonConformity, closeNonConformity, NonConformity } from "@/lib/api/non-conformities"

export function useNonConformities(params?: { page?: number, status?: string }) {
    return useQuery({
        queryKey: ["non-conformities", params],
        queryFn: () => fetchNonConformities(params),
    })
}

export function useNonConformity(id: string) {
    return useQuery({
        queryKey: ["non-conformities", id],
        queryFn: () => fetchNonConformity(id),
        enabled: !!id,
    })
}

export function useUpdateNonConformity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<NonConformity> }) => updateNonConformity(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["non-conformities"] })
            queryClient.invalidateQueries({ queryKey: ["non-conformities", data.id.toString()] })
        },
    })
}

export function useCloseNonConformity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => closeNonConformity(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["non-conformities"] })
            queryClient.invalidateQueries({ queryKey: ["non-conformities", data.id.toString()] })
        },
    })
}
