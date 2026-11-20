'use client'

import { Gauge, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'

// Mock data - replace with TanStack Query hooks
const recentCalibrations = [
  {
    id: 'CAL-2026-001',
    instrument: 'Digital Multimeter DMM-450',
    status: 'completed',
    date: '2026-01-20',
  },
  {
    id: 'CAL-2026-002',
    instrument: 'Pressure Gauge PG-100',
    status: 'in-progress',
    date: '2026-01-21',
  },
  {
    id: 'CAL-2026-003',
    instrument: 'Thermocouple TC-K200',
    status: 'pending',
    date: '2026-01-22',
  },
  {
    id: 'CAL-2026-004',
    instrument: 'Oscilloscope OSC-500',
    status: 'completed',
    date: '2026-01-19',
  },
]

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'in-progress':
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

export default function DashboardPage() {
  const t = useTranslations('Dashboard')
  const { user } = useAuth()

  const stats = [
    {
      title: t('total_instruments'),
      value: '1,247',
      description: t('registered_in_system'),
      icon: Gauge,
      trend: { value: 12, isPositive: true },
    },
    {
      title: t('due_for_calibration'),
      value: '38',
      description: t('within_next_30_days'),
      icon: Clock,
      trend: { value: 5, isPositive: false },
    },
    {
      title: t('overdue'),
      value: '7',
      description: t('requires_attention'),
      icon: AlertTriangle,
    },
    {
      title: t('compliant'),
      value: '96.4%',
      description: t('compliance_rate'),
      icon: CheckCircle,
      trend: { value: 2.1, isPositive: true },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="border-b border-border py-3.5 px-5">
            <CardTitle className="text-sm font-semibold">{t('recent_calibrations')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {recentCalibrations.map((cal) => (
              <div
                key={cal.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-sm font-medium text-foreground">{cal.instrument}</p>
                  <p className="font-mono text-xs text-muted-foreground">{cal.id}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {cal.date}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn('h-5 px-2 text-[11px] font-medium', statusColors[cal.status])}
                  >
                    {t(`status.${cal.status}`)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b border-border py-3.5 px-5">
            <CardTitle className="text-sm font-semibold">{t('upcoming_due_dates')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {[
              { name: 'Torque Wrench TW-50', days: 3, priority: 'high' },
              { name: 'Flow Meter FM-200', days: 7, priority: 'medium' },
              { name: 'Balance Scale BS-1000', days: 14, priority: 'low' },
              { name: 'Voltage Tester VT-110', days: 21, priority: 'low' },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      item.priority === 'high' && 'bg-rose-500',
                      item.priority === 'medium' && 'bg-amber-500',
                      item.priority === 'low' && 'bg-emerald-500'
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.days} {t('days')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
