import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { User, UserFormData, Supplier, SupplierFormData, Station, StationFormData } from '../types'

export const SYSTEM_KEYS = {
    users: ['system', 'users'] as const,
    roles: ['system', 'roles'] as const,
    suppliers: ['system', 'suppliers'] as const,
    stations: ['system', 'stations'] as const,
}

// Users
export function useUsers(page = 1, search = '', per_page = 20) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.users, page, search, per_page],
        queryFn: async () => {
            return await apiClient.get<{ data: User[]; current_page: number; last_page: number; total: number }>(
                `/system/users?page=${page}&search=${search}&per_page=${per_page}`
            )
        },
    })
}

export function useRoles() {
    return useQuery({
        queryKey: SYSTEM_KEYS.roles,
        queryFn: async () => {
            return await apiClient.get<string[]>('/system/roles')
        },
        staleTime: 5 * 60 * 1000,
    })
}

export function useUserMutations() {
    const queryClient = useQueryClient()
    return {
        createUser: useMutation({
            mutationFn: (data: UserFormData) => apiClient.post<User>('/system/users', data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.users }),
        }),
        updateUser: useMutation({
            mutationFn: ({ id, data }: { id: number; data: UserFormData }) => apiClient.put<User>(`/system/users/${id}`, data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.users }),
        }),
    }
}

// Suppliers
export function useSuppliers(page = 1, search = '', per_page = 20) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.suppliers, page, search, per_page],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: per_page.toString()
            })
            if (search) params.append('search', search)
            return await apiClient.get<{ data: Supplier[]; current_page: number; last_page: number; total: number }>(
                `/system/suppliers?${params.toString()}`
            )
        },
    })
}

export function useSupplier(id: string) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.suppliers, id],
        queryFn: async () => {
            const response = await apiClient.get<{ data: Supplier }>(`/system/suppliers/${id}`)
            return (response as any).data || response
        },
        enabled: !!id && id !== 'new',
    })
}

export function useSupplierMutations() {
    const queryClient = useQueryClient()
    return {
        create: useMutation({
            mutationFn: (data: SupplierFormData) => apiClient.post('/system/suppliers', data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.suppliers }),
        }),
        update: useMutation({
            mutationFn: ({ id, data }: { id: number; data: SupplierFormData }) => apiClient.put(`/system/suppliers/${id}`, data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.suppliers }),
        }),
        delete: useMutation({
            mutationFn: (id: number) => apiClient.delete(`/system/suppliers/${id}`),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.suppliers }),
        }),
    }
}

// Stations
export function useStations(page = 1, search = '', per_page = 20) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.stations, page, search, per_page],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: per_page.toString()
            })
            if (search) params.append('search', search)
            return await apiClient.get<{ data: Station[]; current_page: number; last_page: number; total: number }>(
                `/system/stations?${params.toString()}`
            )
        },
    })
}

export function useStation(id: string) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.stations, id],
        queryFn: async () => {
            const response = await apiClient.get<Station>(`/system/stations/${id}`)
            return (response as any).data || response
        },
        enabled: !!id && id !== 'new',
    })
}

export function useStationMutations() {
    const queryClient = useQueryClient()
    return {
        create: useMutation({
            mutationFn: (data: StationFormData) => apiClient.post('/system/stations', data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.stations }),
        }),
        update: useMutation({
            mutationFn: ({ id, data }: { id: number; data: StationFormData }) => apiClient.put(`/system/stations/${id}`, data),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.stations }),
        }),
        delete: useMutation({
            mutationFn: (id: number) => apiClient.delete(`/system/stations/${id}`),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.stations }),
        }),
    }
}

// Competences
export interface Competence {
    instrument_type_id: number;
    instrument_type_name: string;
    valid_until: string | null;
    is_valid: boolean;
}

export function useCompetences(userId: number | null) {
    return useQuery({
        queryKey: [...SYSTEM_KEYS.users, userId, 'competences'],
        queryFn: async () => {
            const response = await apiClient.get<Competence[]>(`/system/users/${userId}/competences`);
            return response as any; // Depending on interceptor, might be response.data
        },
        enabled: !!userId,
    })
}

export function useSyncCompetences() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, competences }: { userId: number; competences: { instrument_type_id: number; valid_until: string | null }[] }) => 
            apiClient.post(`/system/users/${userId}/competences`, { competences }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...SYSTEM_KEYS.users, variables.userId, 'competences'] })
        },
    })
}

// Global Settings
export function useSystemSettings() {
    return useQuery({
        queryKey: ['system', 'settings'],
        queryFn: async () => {
            return await apiClient.get<Record<string, string>>('/system/settings?keys[]=strict_competence_enforcement')
        }
    })
}

export function useUpdateSystemSettings() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (settings: Record<string, string>) => apiClient.put('/system/settings', { settings }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system', 'settings'] })
        }
    })
}

// Supplier Accreditations
export interface SupplierAccreditation {
    instrument_type_id: number;
    instrument_type_name: string;
    range: string | null;
    uncertainty: string | null;
}

export function useSupplierAccreditations(supplierId: number | null) {
    return useQuery({
        queryKey: ['system', 'suppliers', supplierId, 'accreditations'],
        queryFn: async () => {
            return await apiClient.get<SupplierAccreditation[]>(`/metrology/suppliers/${supplierId}/accreditations`);
        },
        enabled: !!supplierId,
    })
}

export function useSyncSupplierAccreditations() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ supplierId, accreditations }: { supplierId: number; accreditations: { instrument_type_id: number; range: string | null; uncertainty: string | null }[] }) => 
            apiClient.post(`/metrology/suppliers/${supplierId}/accreditations`, { accreditations }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['system', 'suppliers', variables.supplierId, 'accreditations'] })
            queryClient.invalidateQueries({ queryKey: SYSTEM_KEYS.suppliers })
        },
    })
}

export function useCheckSupplierAccreditation(supplierId: number | null, instrumentTypeId: number | null) {
    return useQuery({
        queryKey: ['system', 'suppliers', supplierId, 'check-accreditation', instrumentTypeId],
        queryFn: async () => {
            return await apiClient.get<{ is_accredited: boolean; supplier_name: string }>(`/metrology/suppliers/${supplierId}/check-accreditation/${instrumentTypeId}`);
        },
        enabled: !!supplierId && !!instrumentTypeId,
    })
}
