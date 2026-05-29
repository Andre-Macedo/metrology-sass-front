"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { formatDistanceToNow, format } from "date-fns"
import { 
    Gauge, 
    Package, 
    AlertTriangle, 
    CheckCircle, 
    PlusCircle, 
    ExternalLink, 
    Loader2,
    History
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LifecycleEvent {
    type: 'calibration' | 'work_order' | 'non_conformity' | 'non_conformity_closed' | 'creation'
    title: string
    description: string
    date: string
    status: string
    link?: string
    icon: string
}

export function LifecycleTimeline({ instrumentId }: { instrumentId: string }) {
    const { data: events = [], isLoading } = useQuery({
        queryKey: ['instruments', instrumentId, 'lifecycle'],
        queryFn: async () => {
            const res = await apiClient.get<{ data: LifecycleEvent[] }>(`/instruments/${instrumentId}/lifecycle`)
            return res.data || []
        }
    })

    const getIcon = (type: string) => {
        switch (type) {
            case 'calibration': return <Gauge className="h-4 w-4" />
            case 'work_order': return <Package className="h-4 w-4" />
            case 'non_conformity': return <AlertTriangle className="h-4 w-4" />
            case 'non_conformity_closed': return <CheckCircle className="h-4 w-4" />
            case 'creation': return <PlusCircle className="h-4 w-4" />
            default: return <History className="h-4 w-4" />
        }
    }

    const getColorClass = (type: string, status: string) => {
        if (status === 'rejected' || type === 'non_conformity') return "bg-red-100 text-red-600 border-red-200"
        if (status === 'approved' || status === 'pass' || type === 'non_conformity_closed') return "bg-green-100 text-green-600 border-green-200"
        if (status === 'received' || status === 'in_queue') return "bg-blue-100 text-blue-600 border-blue-200"
        return "bg-slate-100 text-slate-600 border-slate-200"
    }

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    if (events.length === 0) return <div className="text-center p-12 text-muted-foreground">No history recorded for this asset.</div>

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {events.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-6 pl-12 group">
                    {/* Dot / Icon */}
                    <div className={cn(
                        "absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110",
                        getColorClass(event.type, event.status)
                    )}>
                        {getIcon(event.type)}
                    </div>

                    <div className="flex-1 space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-foreground">{event.title}</h4>
                            <time className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">
                                {format(new Date(event.date), 'dd MMM yyyy')}
                            </time>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.description}
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground italic">
                                {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                            </span>
                            {event.link && (
                                <Link 
                                    href={event.link} 
                                    className="text-[10px] text-primary font-semibold flex items-center hover:underline gap-0.5"
                                >
                                    View Record <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
