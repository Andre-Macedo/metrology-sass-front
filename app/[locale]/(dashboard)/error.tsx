'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function DashboardErrorBoundary({ error, reset }: ErrorBoundaryProps) {
    useEffect(() => {
        console.error('Dashboard Error Boundary captured:', error)
    }, [error])

    return (
        <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Ocorreu uma falha no carregamento do painel
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                {error.message || 'Não foi possível carregar os dados desta seção operacional. Verifique sua conexão e tente novamente.'}
            </p>
            {error.digest && (
                <p className="mt-1 font-mono text-xs text-gray-400">
                    ID do erro: {error.digest}
                </p>
            )}
            <div className="mt-6 flex gap-3">
                <Button onClick={() => reset()} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Tentar Novamente
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Recarregar Página
                </Button>
            </div>
        </div>
    )
}
