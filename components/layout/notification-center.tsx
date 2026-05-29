"use client"

import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/features/system/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function NotificationCenter() {
    const router = useRouter()
    const { data: notifications = [], isLoading } = useNotifications()
    const { data: unreadCount = 0 } = useUnreadNotificationsCount()
    const markAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead.mutateAsync(id)
        if (link) {
            router.push(link)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <DropdownMenuLabel className="p-0 font-bold">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                            onClick={() => markAllAsRead.mutate()}
                            disabled={markAllAsRead.isPending}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n.id, n.data.link)}
                                    className={`flex flex-col gap-1 p-4 text-left hover:bg-muted transition-colors border-b last:border-0 ${!n.read_at ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-semibold ${!n.read_at ? 'text-primary' : ''}`}>
                                            {n.data.title}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {n.data.message}
                                    </p>
                                    {!n.read_at && (
                                        <Badge variant="outline" className="w-fit text-[10px] h-4 px-1 py-0 mt-1">New</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/dashboard/system/notifications')}>
                        View all activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
