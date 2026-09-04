"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardStats } from "../../hooks/use-dashboard"
import Link from "next/link"

interface UpcomingListProps {
    items: DashboardStats['upcoming']
}

export function UpcomingList({ items }: UpcomingListProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Upcoming Calibrations</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.length === 0 && <p className="text-sm text-muted-foreground">No upcoming calibrations.</p>}

                    {items.map(item => (
                        <Link href={`metrology/instruments/${item.id}`} key={item.id} className="block">
                            <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.code}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{item.formatted_date}</p>
                                    <Badge variant={item.days_remaining < 0 ? 'destructive' : 'secondary'} className="text-xs">
                                        {item.days_remaining < 0 ? 'Overdue' : `${item.days_remaining} days`}
                                    </Badge>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
