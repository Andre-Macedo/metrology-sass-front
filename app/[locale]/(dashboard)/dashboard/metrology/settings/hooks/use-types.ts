import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { InstrumentType, ReferenceStandardType } from "@/app/[locale]/(dashboard)/dashboard/metrology/settings/lib/schema"

// --- Instrument Types ---

export function useInstrumentTypes() {
    return useQuery({
        queryKey: ["instrument-types"],
        queryFn: async () => {
            // Assuming the API returns a flat array for now based on Controller index()
            return apiClient.get<InstrumentType[]>("/instrument-types")
        },
    })
}

export function useCreateInstrumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: InstrumentType) => apiClient.post("/instrument-types", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instrument-types"] })
        },
    })
}

export function useUpdateInstrumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: InstrumentType }) =>
            apiClient.put(`/instrument-types/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instrument-types"] })
        },
    })
}

export function useDeleteInstrumentType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/instrument-types/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instrument-types"] })
        },
    })
}


// --- Reference Standard Types ---

export function useReferenceStandardTypes() {
    return useQuery({
        queryKey: ["reference-standard-types"],
        queryFn: async () => {
            return apiClient.get<ReferenceStandardType[]>("/reference-standard-types")
        },
    })
}

export function useCreateReferenceStandardType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: ReferenceStandardType) => apiClient.post("/reference-standard-types", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reference-standard-types"] })
        },
    })
}

export function useUpdateReferenceStandardType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ReferenceStandardType }) =>
            apiClient.put(`/reference-standard-types/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reference-standard-types"] })
        },
    })
}

export function useDeleteReferenceStandardType() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/reference-standard-types/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reference-standard-types"] })
        },
    })
}
