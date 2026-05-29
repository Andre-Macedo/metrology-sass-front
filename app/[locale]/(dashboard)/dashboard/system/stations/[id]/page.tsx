"use client"

import { useParams } from "next/navigation"
import { useStation, Station } from "@/features/system"
import { useInstruments } from "@/features/instruments"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
    Monitor, 
    Cpu, 
    Network, 
    MapPin, 
    Gauge, 
    History, 
    ArrowLeft, 
    Loader2, 
    AlertCircle,
    Activity,
    Settings,
    Package
} from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { Instrument } from "@/features/instruments/types"
import { Link } from "@/i18n/routing"

export default function StationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const t = useTranslations('Stations')
    const tInst = useTranslations('Instruments')
    
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const { data: station, isLoading: isStationLoading } = useStation(params.id as string)
    const { data: instrumentsData, isLoading: isInstrumentsLoading } = useInstruments({ 
        station_id: params.id as string,
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize
    })

    if (isStationLoading) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Carregando detalhes da estação...</p>
        </div>
    )

    if (!station) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Estação não encontrada</p>
            <Button onClick={() => router.back()}>Voltar</Button>
        </div>
    )

    const instrumentColumns: ColumnDef<Instrument>[] = [
        {
            accessorKey: "name",
            header: "Instrumento",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link href={`/dashboard/metrology/instruments/${row.original.id}`} className="font-bold hover:underline text-primary">
                        {row.original.name}
                    </Link>
                    <span className="text-[10px] font-mono text-muted-foreground">{row.original.serial_number}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">{row.original.status}</Badge>
            )
        },
        {
            accessorKey: "last_calibration_date",
            header: "Última Calibração",
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <PageHeader 
                        title={station.name} 
                        description={`Estação de Trabalho do tipo ${station.type}`} 
                    />
                </div>
                <div className="flex gap-2">
                    <Badge variant={station.status === 'Active' ? 'default' : 'secondary'} className="h-8 px-4 text-sm">
                        {station.status === 'Active' && <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />}
                        {station.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" /> Configurar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Identidade Digital Card */}
                <Card className="shadow-sm border-t-4 border-t-primary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-primary" />
                            Identidade Digital
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Hostname</p>
                                <p className="font-mono font-bold text-sm flex items-center gap-2">
                                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                                    {station.hostname || 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Endereço IP</p>
                                <p className="font-mono font-bold text-sm flex items-center gap-2">
                                    <Network className="h-3.5 w-3.5 text-slate-400" />
                                    {station.ip_address || '—'}
                                </p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg border">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Localização</p>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    {station.location || 'Não definida'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumo de Ativos Card */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            Capacidade e Carga
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/10">
                                <span className="text-4xl font-black text-primary">{station.instruments_count || 0}</span>
                                <span className="text-xs uppercase font-bold text-muted-foreground mt-2">Instrumentos Alocados</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border">
                                <span className="text-4xl font-black text-slate-700">0</span>
                                <span className="text-xs uppercase font-bold text-muted-foreground mt-2">Calibrações Hoje</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-3 mt-4">
                    <Tabs defaultValue="instruments" className="w-full">
                        <TabsList className="bg-muted/50 border h-12 p-1">
                            <TabsTrigger value="instruments" className="gap-2 px-6">
                                <Gauge className="h-4 w-4" /> Instrumentos na Estação
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="gap-2 px-6">
                                <Activity className="h-4 w-4" /> Log de Operações
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="instruments" className="mt-6 animate-in fade-in zoom-in-95">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Inventário Local</CardTitle>
                                    <CardDescription>Lista de equipamentos vinculados fisicamente a esta estação.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DataTable 
                                        columns={instrumentColumns} 
                                        data={instrumentsData?.data || []} 
                                        isLoading={isInstrumentsLoading}
                                        rowCount={instrumentsData?.meta?.total || 0}
                                        pagination={pagination}
                                        onPaginationChange={setPagination}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <History className="h-5 w-5 text-muted-foreground" />
                                        Histórico de Acesso
                                    </CardTitle>
                                    <CardDescription>Eventos de login e atividades técnicas detectadas nesta máquina.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground italic">
                                    Funcionalidade de logs de estação em desenvolvimento...
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
