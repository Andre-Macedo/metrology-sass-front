import { apiClient } from './client'
import { SupportTicket } from '../types'

export const supportApi = {
    list: async () => {
        return await apiClient.get<SupportTicket[]>('/system/tickets')
    },
    
    get: async (id: string) => {
        return await apiClient.get<SupportTicket>(`/system/tickets/${id}`)
    },
    
    create: async (data: { subject: string; description: string; priority: string; category: string }) => {
        return await apiClient.post<SupportTicket>('/system/tickets', data)
    },
    
    addMessage: async (ticketId: string, message: string) => {
        return await apiClient.post(`/system/tickets/${ticketId}/messages`, { message })
    }
}
