import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { AuditLog, auditLogSchema } from '@/app/[locale]/(dashboard)/dashboard/metrology/lib/audit-log-schema'

interface UseAuditLogsParams {
    auditable_type: 'instrument' | 'standard' | 'calibration'
    auditable_id: string | number
}

function adapter(data: any): AuditLog {
    return auditLogSchema.parse(data)
}

export function useAuditLogs({ auditable_type, auditable_id }: UseAuditLogsParams) {
    return useQuery({
        queryKey: ['audit-logs', auditable_type, auditable_id],
        queryFn: async () => {
            if (!auditable_id) return []
            const response = await apiClient.get<any>('/audit-logs', {
                auditable_type,
                auditable_id: String(auditable_id)
            })
            // Handle pagination if needed, for now assuming data wrapper or array
            const items = response.data || []
            return items.map(adapter)
        },
        enabled: !!auditable_id
    })
}
