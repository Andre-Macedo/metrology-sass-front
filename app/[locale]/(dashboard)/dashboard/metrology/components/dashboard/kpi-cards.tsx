"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, AlertTriangle, CalendarDays } from 'lucide-react'
import { DashboardStats } from "../hooks/use-dashboard"

interface KPICardsProps {
    kpis: DashboardStats['kpis']
}

export function KPICards({ kpis }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Active Instruments</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.active_count}</div>
                    <p className="text-xs text-muted-foreground">Registered and active</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Instruments</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{kpis.overdue_count}</div>
                    <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{kpis.due_month_count}</div>
                    <p className="text-xs text-muted-foreground">Upcoming within 30 days</p>
                </CardContent>
            </Card>
        </div>
    )
}
