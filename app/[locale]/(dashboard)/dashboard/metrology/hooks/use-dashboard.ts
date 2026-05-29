import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export interface DashboardStats {
    kpis: {
        active_count: number
        overdue_count: number
        due_month_count: number
    }
    upcoming: UpcomingItem[]
    recent_activity: RecentActivityItem[]
}

export interface UpcomingItem {
    id: number
    name: string
    code: string
    formatted_date: string
    days_remaining: number
}

export interface RecentActivityItem {
    id: string
    item: string
    result: string
    technician: string
    date: string
}

export function useMetrologyDashboard() {
    return useQuery({
        queryKey: ['metrology-dashboard'],
        queryFn: async () => {
            return await apiClient.get<DashboardStats>('/dashboard/stats')
        }
    })
}
