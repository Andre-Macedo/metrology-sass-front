'use client'

import React from 'react'
import { CreditCard, LogOut, MessageSquare, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { useTranslations } from 'next-intl'

export default function SubscriptionExpiredPage() {
    const { logout, isLoggingOut, user } = useAuth()
    const t = useTranslations('Billing')

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-lg border-0 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                        <CreditCard className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                        Assinatura Pendente
                    </CardTitle>
                    <CardDescription className="text-base">
                        Detectamos que a conta da <strong>{user?.tenant_id ? 'sua empresa' : 'sua organização'}</strong> está com o acesso suspenso.
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 py-6">
                    <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-warning-foreground">Por que estou vendo isso?</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                O acesso operacional ao sistema Amemiya requer uma assinatura ativa. 
                                Isso pode ocorrer devido ao fim do período de teste, atraso no pagamento ou cancelamento do plano.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Para restabelecer o acesso aos seus instrumentos e calibrações, 
                            entre em contato com o nosso departamento financeiro.
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-muted/20">
                    <Button variant="default" className="w-full sm:flex-1 h-11" asChild>
                        <a href="mailto:financeiro@amemiya.com.br?subject=Assinatura Suspensa">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Falar com Suporte
                        </a>
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        className="w-full sm:flex-1 h-11" 
                        onClick={() => logout()}
                        disabled={isLoggingOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da Conta
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
