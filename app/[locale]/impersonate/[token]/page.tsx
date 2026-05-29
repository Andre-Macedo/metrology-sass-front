'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { Loader2, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ImpersonatePage() {
    const params = useParams()
    const token = params.token as string
    const { impersonate, isPerformingImpersonation, impersonateError } = useAuth()

    useEffect(() => {
        if (token) {
            impersonate(token)
        }
    }, [token, impersonate])

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                        <Fingerprint className="h-8 w-8 text-warning" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Acesso Administrativo</CardTitle>
                    <CardDescription>
                        Validando suas credenciais de personificação...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    {isPerformingImpersonation && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Configurando ambiente de suporte...
                            </p>
                        </div>
                    )}

                    {impersonateError && (
                        <div className="text-center">
                            <div className="mb-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                                {(impersonateError as Error).message || "Ocorreu um erro ao validar o token de acesso."}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                O token pode ter expirado ou já ter sido utilizado. 
                                Por favor, solicite um novo acesso no painel de administração.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
