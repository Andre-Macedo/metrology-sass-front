"use client"

import { Station } from "../types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
    Monitor, 
    Laptop, 
    Smartphone, 
    Microscope, 
    MapPin, 
    Cpu, 
    Network, 
    Eye, 
    Edit, 
    Trash2,
    Activity,
    Factory
} from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

interface StationCardProps {
    station: Station
    onEdit: (station: Station) => void
    onDelete: (id: number) => void
}

export function StationCard({ station, onEdit, onDelete }: StationCardProps) {
    const t = useTranslations('Stations')
    const tTypes = useTranslations('Stations.types')
    const tStatus = useTranslations('Stations.status')

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Laboratory': return <Microscope className="h-5 w-5" />
            case 'Production': return <Factory className="h-5 w-5" />
            case 'Mobile': return <Smartphone className="h-5 w-5" />
            default: return <Monitor className="h-5 w-5" />
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Active': return 'default'
            case 'Maintenance': return 'warning'
            case 'Inactive': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-t-primary/20">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {getTypeIcon(station.type)}
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold leading-tight">{station.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter h-5">
                            {tTypes(station.type)}
                        </Badge>
                    </div>
                </div>
                <Badge variant={getStatusVariant(station.status)} className="h-6">
                    <span className="flex items-center gap-1.5">
                        {station.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {tStatus(station.status)}
                    </span>
                </Badge>
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{station.location || t('table.location')}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2 bg-muted/40 rounded-md border border-dashed">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
                            <Cpu className="h-3 w-3" /> Hostname
                        </div>
                        <p className="text-xs font-mono font-bold truncate" title={station.hostname}>
                            {station.hostname || '—'}
                        </p>
                    </div>
                    <div className="p-2 bg-muted/40 rounded-md border border-dashed">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mb-0.5">
                            <Network className="h-3 w-3" /> IP Address
                        </div>
                        <p className="text-xs font-mono font-bold">
                            {station.ip_address || '—'}
                        </p>
                    </div>
                </div>

                {station.instruments_count !== undefined && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary/80 uppercase tracking-widest pt-2">
                        <Activity className="h-3 w-3" />
                        {station.instruments_count} Instruments Assigned
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2 bg-muted/10 border-t flex justify-between gap-2">
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(station)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(station.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <Button asChild variant="secondary" size="sm" className="h-8 gap-1.5 font-bold">
                    <Link href={`/dashboard/system/stations/${station.id}`}>
                        <Eye className="h-3.5 w-3.5" /> {t('table.view_details') || 'Details'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
