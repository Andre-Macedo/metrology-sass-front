"use client"

import { PageHeader } from "@/components/layout/page-header"
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/features/system/hooks/use-notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Bell, AlertTriangle, Info, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
    const router = useRouter()
    const { data: notifications = [], isLoading } = useNotifications()
    const markAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const getIcon = (type: string) => {
        if (type.includes('critical') || type.includes('rejected')) return <AlertTriangle className="h-5 w-5 text-destructive" />
        if (type.includes('due')) return <Calendar className="h-5 w-5 text-warning" />
        return <Info className="h-5 w-5 text-primary" />
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="All Notifications"
                    description="Keep track of all measurement alerts and system activity."
                />
                {notifications.some(n => !n.read_at) && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={markAllAsRead.isPending}
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-medium">Your inbox is clear</h3>
                        <p className="text-muted-foreground">We'll notify you here when there's an update on your calibrations or system alerts.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <Card key={n.id} className={`${!n.read_at ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="mt-1">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{n.data.title}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(n.created_at), 'dd/MM/yyyy HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {n.data.message}
                                    </p>
                                    <div className="pt-2 flex items-center gap-2">
                                        {n.data.link && (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="h-auto p-0 text-xs"
                                                onClick={() => {
                                                    markAsRead.mutate(n.id)
                                                    router.push(n.data.link!)
                                                }}
                                            >
                                                View details
                                            </Button>
                                        )}
                                        {!n.read_at && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-auto p-0 text-xs text-muted-foreground"
                                                onClick={() => markAsRead.mutate(n.id)}
                                            >
                                                Mark as read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
