import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Gauge, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const meta: Meta<typeof StatCard> = {
    title: 'Dashboard/StatCard',
    component: StatCard,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof StatCard>

export const TotalInstruments: Story = {
    args: {
        title: 'Total Instruments',
        value: '1,284',
        icon: Gauge,
        trend: {
            value: 12,
            isPositive: true
        },
        description: 'from last month'
    },
}

export const Rejected: Story = {
    args: {
        title: 'Critical Deviations',
        value: '14',
        icon: AlertTriangle,
        trend: {
            value: 2,
            isPositive: false
        },
        description: 'Requires immediate CAPA'
    },
}

export const Approved: Story = {
    args: {
        title: 'Calibrations Done',
        value: '85',
        icon: CheckCircle,
        description: 'Completed this week'
    },
}
