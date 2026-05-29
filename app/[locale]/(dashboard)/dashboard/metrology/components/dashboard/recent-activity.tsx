"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "../hooks/use-dashboard"
import { CheckCircle2, XCircle } from "lucide-react"

interface RecentActivityProps {
    activities: DashboardStats['recent_activity']
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}

                    {activities.map((activity, index) => (
                        <div key={index} className="flex items-center">
                            {activity.result === 'approved'
                                ? <CheckCircle2 className="mr-4 h-9 w-9 text-green-500" />
                                : <XCircle className="mr-4 h-9 w-9 text-red-500" />
                            }
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Calibration {activity.result === 'approved' ? 'Approved' : 'Rejected'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.item} by {activity.technician}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-xs text-muted-foreground">
                                {activity.date}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
