'use client'

import React from 'react'
import { CreditCard, Zap, Users, Gauge, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useBilling } from '@/lib/hooks/use-billing'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

export default function BillingPage() {
    const { data, isLoading } = useBilling()

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    const { plan, subscription, usage } = data || {}

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-success/10 text-success border-success/20">Ativa</Badge>
            case 'trialing': return <Badge className="bg-info/10 text-info border-info/20">Período de Teste</Badge>
            case 'past_due': return <Badge variant="destructive">Pagamento Atrasado</Badge>
            default: return <Badge variant="secondary">{status || 'Inativo'}</Badge>
        }
    }

    const calculatePercentage = (current: number, limit: number) => {
        if (limit === 0) return 0
        return Math.min(Math.round((current / limit) * 100), 100)
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assinatura e Faturamento</h1>
                <p className="text-muted-foreground">Gerencie seu plano e acompanhe os limites de uso industrial.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Plano Atual */}
                <Card className="lg:col-span-2 border-primary/20 bg-primary/5 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="h-24 w-24 text-primary" />
                    </div>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl">Plano: {plan?.name || 'Nenhum plano ativo'}</CardTitle>
                            {getStatusBadge(subscription?.status)}
                        </div>
                        <CardDescription className="text-base max-w-md">
                            {plan?.description || 'Você não possui uma assinatura vinculada no momento.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold tracking-tight">
                                R$ {plan?.price ? Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                            </span>
                            <span className="text-muted-foreground">/mês</span>
                        </div>
                        
                        {subscription?.next_billing_at && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Próxima renovação: {format(new Date(subscription.next_billing_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="border-t bg-background/50 pt-6">
                        <Button className="w-full sm:w-auto" variant="default">
                            Mudar de Plano
                        </Button>
                    </CardFooter>
                </Card>

                {/* Status Financeiro Rapido */}
                <Card className="flex flex-col justify-between shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Gateway de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-4 gap-4">
                            <div className="p-4 rounded-full bg-muted">
                                <CreditCard className="h-8 w-8 text-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold capitalize">{subscription?.gateway || 'Manual'}</p>
                                <p className="text-xs text-muted-foreground">Faturamento Direto</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="ghost" className="w-full text-xs" disabled>
                            Ver Histórico de Recibos
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Limites de Uso */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    Uso dos Recursos do Plano
                </h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Instrumentos */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Instrumentos Cadastrados</CardTitle>
                                <span className="text-xs font-bold text-primary">
                                    {usage?.instruments.limit === 0 ? 'ILIMITADO' : `${usage?.instruments.current} / ${usage?.instruments.limit}`}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {usage?.instruments.limit !== 0 && (
                                <Progress value={calculatePercentage(usage!.instruments.current, usage!.instruments.limit)} className="h-2" />
                            )}
                            <p className="text-xs text-muted-foreground">
                                {usage?.instruments.limit === 0 
                                    ? 'Seu plano permite cadastrar instrumentos sem restrições de quantidade.' 
                                    : `Você utilizou ${calculatePercentage(usage!.instruments.current, usage!.instruments.limit)}% da sua cota de instrumentos.`}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Usuários */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Usuários da Equipe</CardTitle>
                                <span className="text-xs font-bold text-primary">
                                    {usage?.users.limit === 0 ? 'ILIMITADO' : `${usage?.users.current} / ${usage?.users.limit}`}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {usage?.users.limit !== 0 && (
                                <Progress value={calculatePercentage(usage!.users.current, usage!.users.limit)} className="h-2" />
                            )}
                            <p className="text-xs text-muted-foreground">
                                {usage?.users.limit === 0 
                                    ? 'Você pode adicionar quantos técnicos desejar à sua organização.' 
                                    : `Você possui ${usage?.users.current} usuários ativos de um total de ${usage?.users.limit}.`}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Alerta de Compliance */}
            <div className="rounded-lg border bg-muted/30 p-6 flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Conta Verificada e Segura</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Sua organização está operando sob as normas de conformidade técnica do sistema Amemiya. 
                        Todos os registros de calibração estão sendo assinados e auditados conforme o padrão ISO 17025.
                    </p>
                </div>
            </div>
        </div>
    )
}
