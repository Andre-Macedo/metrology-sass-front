"use client"

import { PageHeader } from '@/components/layout/page-header'
import { useMetrologyStats } from '@/app/[locale]/(dashboard)/dashboard/metrology/hooks/use-metrology-stats'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Gauge, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useTranslations, useLocale } from 'next-intl'

export default function MetrologyPage() {
    const t = useTranslations('MetrologyDashboard')
    const tCal = useTranslations('Calibrations')
    const locale = useLocale()
    const { data, isLoading } = useMetrologyStats()

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    const stats = data?.kpi

    return (
        <div className="space-y-8">
            <PageHeader
                title={t('title')}
                description={t('description')}
            />

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('total_instruments')}</CardTitle>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_instruments}</div>
                        <p className="text-xs text-muted-foreground">{t('registered_assets')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('compliance_rate')}</CardTitle>
                        <CheckCircle className={`h-4 w-4 ${stats?.compliance_rate && stats.compliance_rate > 95 ? 'text-green-500' : 'text-yellow-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.compliance_rate}%</div>
                        <p className="text-xs text-muted-foreground">{t('active_instruments')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('overdue')}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats?.overdue_count}</div>
                        <p className="text-xs text-muted-foreground">{t('requires_attention')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('in_calibration')}</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.in_calibration_count}</div>
                        <p className="text-xs text-muted-foreground">{t('currently_serviced')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Due */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            {t('upcoming_calibrations')}
                        </CardTitle>
                        <CardDescription>{t('due_in_30_days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.upcoming_due.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('no_upcoming')}</p>
                            ) : (
                                data?.upcoming_due.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.serial_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-yellow-600">
                                                {format(parseISO(item.calibration_due), 'dd/MM/yyyy')}
                                            </p>
                                            <Badge variant="outline" className="text-[10px] h-5">{t('due_soon')}</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            {t('recent_activity')}
                        </CardTitle>
                        <CardDescription>{t('latest_calibrations')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recent_calibrations.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('no_recent_activity')}</p>
                            ) : (
                                data?.recent_calibrations.map((cal) => (
                                    <div key={cal.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{cal.item_name}</p>
                                            <p className="text-xs text-muted-foreground">Cert: {cal.certificate || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">{format(parseISO(cal.date), 'dd/MM')}</span>
                                            <Badge variant={cal.result === 'pass' ? 'default' : 'destructive'}>
                                                {tCal(`result.${cal.result}`) || cal.result}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
