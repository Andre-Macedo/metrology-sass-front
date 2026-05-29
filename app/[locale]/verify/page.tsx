'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Loader2 } from 'lucide-react'

function VerifyContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const locale = useLocale()
    
    useEffect(() => {
        const token = searchParams.get('token')
        
        if (token) {
            // Salva o token vindo do domínio central no localStorage do subdomínio atual
            localStorage.setItem('auth_token', token)
            localStorage.removeItem('is_impersonating')
            
            // Redireciona para o dashboard
            router.push(`/${locale}/dashboard`)
        } else {
            // Se não houver token, volta para o login
            router.push(`/${locale}/login`)
        }
    }, [searchParams, router, locale])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
                <h2 className="text-xl font-semibold">Sincronizando Acesso</h2>
                <p className="text-sm text-muted-foreground">Preparando seu ambiente de trabalho industrial...</p>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={null}>
            <VerifyContent />
        </Suspense>
    )
}
