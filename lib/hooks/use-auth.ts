'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { apiClient } from '@/lib/api/client'

interface User {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    signature_image_path?: string
    tenant_id?: string
}

interface LoginCredentials {
    email: string
    password: string
}

interface AuthResponse {
    user: User & { redirect_domain?: string }
    token: string
}

const AUTH_QUERY_KEY = ['auth', 'user']

export function useAuth() {
    const router = useRouter()
    const locale = useLocale() || 'pt-BR'
    const queryClient = useQueryClient()

    // Get current user
    const {
        data: user,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            const token = localStorage.getItem('auth_token')
            if (!token) return null

            try {
                const response = await apiClient.get<User>('/system/profile')
                return response
            } catch {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('is_impersonating')
                return null
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const response = await apiClient.post<AuthResponse>('/login', credentials)
            return response
        },
        onSuccess: (data) => {
            const currentHost = typeof window !== 'undefined' ? window.location.host : ''
            const targetDomain = data.user.redirect_domain

            // Se o usuário pertence a um tenant e não estamos no domínio dele ainda
            if (targetDomain && currentHost !== targetDomain && !currentHost.includes('localhost:3000')) {
                // Redireciona para o domínio do tenant passando o token via URL para captura
                // Usamos a rota /verify que já existe ou uma similar
                window.location.href = `http://${targetDomain}/${locale}/verify?token=${data.token}`
                return
            }

            // Fluxo normal (mesmo domínio ou ambiente de dev local)
            localStorage.setItem('auth_token', data.token)
            if (data.user.tenant_slug) {
                localStorage.setItem('current_tenant_slug', data.user.tenant_slug)
            } else {
                localStorage.removeItem('current_tenant_slug')
            }
            localStorage.removeItem('is_impersonating')
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
            router.push(`/${locale}/dashboard`)
        },
    })

    // Impersonate mutation
    const impersonateMutation = useMutation({
        mutationFn: async (token: string) => {
            const response = await apiClient.post<AuthResponse>('/impersonate', { token })
            return response
        },
        onSuccess: (data) => {
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('is_impersonating', 'true')
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
            router.push(`/${locale}/dashboard`)
        },
    })

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            try {
                await apiClient.post('/system/logout')
            } catch {
                // Ignore logout errors
            }
        },
        onSettled: () => {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('is_impersonating')
            queryClient.setQueryData(AUTH_QUERY_KEY, null)
            queryClient.clear()
            router.push(`/${locale}/login`)
        },
    })

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        isImpersonating: !!(typeof window !== 'undefined' && localStorage.getItem('is_impersonating')),
        error,
        refetch,
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        impersonate: impersonateMutation.mutate,
        impersonateAsync: impersonateMutation.mutateAsync,
        isPerformingImpersonation: impersonateMutation.isPending,
        impersonateError: impersonateMutation.error,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    }
}
