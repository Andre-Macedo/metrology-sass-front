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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recent_calibrations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalibrations.map((cal) => (
                <div
                  key={cal.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{cal.instrument}</p>
                    <p className="text-xs text-muted-foreground">{cal.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {cal.date}
                    </span>
                    <Badge
                      variant="secondary"
                      className={statusColors[cal.status]}
                    >
                      {t(`status.${cal.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('upcoming_due_dates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Torque Wrench TW-50', days: 3, priority: 'high' },
                { name: 'Flow Meter FM-200', days: 7, priority: 'medium' },
                { name: 'Balance Scale BS-1000', days: 14, priority: 'low' },
                { name: 'Voltage Tester VT-110', days: 21, priority: 'low' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        item.priority === 'high' && 'bg-red-500',
                        item.priority === 'medium' && 'bg-yellow-500',
                        item.priority === 'low' && 'bg-green-500'
                      )}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.days} {t('days')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
