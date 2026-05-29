import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { AccessLog } from '../types'

export const ACCESS_LOG_KEYS = {
    all: ['system', 'access-logs'] as const,
    lists: () => [...ACCESS_LOG_KEYS.all, 'list'] as const,
    list: (filters: string) => [...ACCESS_LOG_KEYS.lists(), { filters }] as const,
}

interface FetchParams {
    page?: number
    per_page?: number
}

export function useAccessLogs(params: FetchParams = {}) {
    const { page = 1, per_page = 20 } = params
    
    return useQuery({
        queryKey: ACCESS_LOG_KEYS.list(JSON.stringify(params)),
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                per_page: per_page.toString()
            })
                
            return await apiClient.get<{ data: AccessLog[]; current_page: number; last_page: number; total: number }>(
                `/system/access-logs?${queryParams.toString()}`
            )
        },
    })
}
