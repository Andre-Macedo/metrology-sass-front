'use client'

import { useQuery } from '@tanstack/react-query'
import { billingApi } from '@/lib/api/billing'

export function useBilling() {
    return useQuery({
        queryKey: ['system', 'billing'],
        queryFn: billingApi.getDetails,
    })
}
