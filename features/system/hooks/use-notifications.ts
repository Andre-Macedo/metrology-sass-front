import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export interface NotificationData {
    id: string
    type: string
    data: {
        title: string
        message: string
        link?: string
        [key: string]: any
    }
    read_at: string | null
    created_at: string
}

export const NOTIFICATION_KEYS = {
    all: ['system', 'notifications'] as const,
    unreadCount: () => [...NOTIFICATION_KEYS.all, 'unread-count'] as const,
}

export function useNotifications() {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.all,
        queryFn: async () => {
            const res = await apiClient.get<{ data: NotificationData[] }>('/system/notifications')
            return res.data || []
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: NOTIFICATION_KEYS.unreadCount(),
        queryFn: async () => {
            const res = await apiClient.get<{ count: number }>('/system/notifications/unread-count')
            return res.count || 0
        },
        refetchInterval: 30000,
    })
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => apiClient.post(`/system/notifications/${id}/mark-as-read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() })
        },
    })
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () => apiClient.post('/system/notifications/mark-all-as-read'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() })
        },
    })
}
