import { apiClient } from './client'

export interface BillingData {
    tenant: {
        name: string;
        status: string;
    };
    plan: {
        name: string;
        description?: string;
        price: number;
    } | null;
    subscription: {
        status: string;
        next_billing_at?: string;
        ends_at?: string;
        trial_ends_at?: string;
        gateway: string;
    } | null;
    usage: {
        instruments: {
            current: number;
            limit: number;
        };
        users: {
            current: number;
            limit: number;
        };
    };
}

export const billingApi = {
    getDetails: async () => {
        return await apiClient.get<BillingData>('/system/billing')
    }
}
