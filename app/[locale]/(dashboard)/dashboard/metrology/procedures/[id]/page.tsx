"use client"

import { useProcedure } from "@/app/[locale]/(dashboard)/dashboard/metrology/procedures/hooks/use-procedures"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
    Edit, 
    ArrowLeft, 
    Settings, 
    Gauge, 
    ListChecks, 
    Target, 
    FileText,
    Activity,
    Beaker,
    Calendar,
    Clock,
    FileCode,
    Layers
} from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { use } from "react"
import { Link } from "@/i18n/routing"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function ProcedureDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { data: procedure, isLoading } = useProcedure(id)

    if (isLoading) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <Activity className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando detalhes do procedimento...</p>
            </div>
        )
    }

    if (!procedure) {
        return <div className="p-8">Procedimento não encontrado</div>
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <PageHeader
                        title={procedure.name}
                        description={`Procedimento Operacional Padrão (POP)`}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/metrology/procedures/${id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar Procedimento
                    </Button>
                </div>
            </div>

            {/* Summary Technical Card (Instrument Style) */}
            <Card className="overflow-hidden shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            General Information
                        </CardTitle>
                        <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-widest text-[10px] px-3">
                            Internal Protocol
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Visual Icon Area */}
                        <div className="w-full lg:w-1/5 flex flex-col items-center border-r pr-8">
                            <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-xl border bg-muted flex items-center justify-center group">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <FileCode className="h-12 w-12 opacity-20 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Routine Method</span>
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs Grid */}
                        <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Application / Type</p>
                                    {procedure.instrument_type_id ? (
                                        <Link 
                                            href={`/dashboard/metrology/settings/instrument-types/${procedure.instrument_type_id}`}
                                            className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                                        >
                                            <Gauge className="h-3.5 w-3.5" />
                                            {procedure.instrument_type || `Type #${procedure.instrument_type_id}`}
                                        </Link>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-500 italic">Not Specified</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Procedure ID</p>
                                    <p className="text-sm font-mono font-bold text-slate-600">#{procedure.id}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Current Revision</p>
                                    <Badge variant="secondary" className="font-bold">v1.0</Badge>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Checkpoint Count</p>
                                    <p className="text-sm font-bold flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                        {procedure.items.length} Points
                                    </p>
                                </div>
                                
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Created Date</p>
                                    <p className="text-sm font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        {new Date(procedure.created_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Last Modified</p>
                                    <p className="text-sm font-medium flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {new Date(procedure.updated_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-1.5 lg:col-span-2 bg-slate-50 p-3 rounded-lg border border-dashed text-slate-600">
                                    <p className="text-[10px] font-black uppercase tracking-tighter mb-1">Traceability Note</p>
                                    <p className="text-[11px] leading-tight">This procedure defines the technical sequence required for ISO 17025 compliant calibrations. All numeric points require standard uncertainty calculation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Steps Table - Wide */}
            <Card className="shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                Sequence of Verification (Checkpoints)
                            </CardTitle>
                            <CardDescription>Detailed technical steps for instrument calibration.</CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono">Metrology Standard</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[60px] text-center">Order</TableHead>
                                <TableHead>Step Description</TableHead>
                                <TableHead>Logic Type</TableHead>
                                <TableHead className="text-center text-primary font-bold">Target Value</TableHead>
                                <TableHead className="text-center text-destructive font-bold">Max Tolerance</TableHead>
                                <TableHead className="text-center">Required Readings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {procedure.items
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((item) => (
                                    <TableRow key={item.id || item.step} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.order}</TableCell>
                                        <TableCell className="font-medium">{item.step}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {item.question_type === 'numeric' ? <Target className="h-3.5 w-3.5 text-blue-500" /> : <Beaker className="h-3.5 w-3.5 text-purple-500" />}
                                                <span className="text-[10px] uppercase font-black tracking-tighter text-slate-500">
                                                    {item.question_type === 'numeric' ? 'Quantitative' : 'Qualitative'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-mono font-bold text-sm">
                                            {item.question_type === 'numeric' ? (
                                                <span className="text-blue-600">{item.nominal_value}</span>
                                            ) : (
                                                <span className="text-muted-foreground/30">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-mono font-bold text-sm">
                                            {item.question_type === 'numeric' ? (
                                                <span className="text-destructive">± {item.criteria}</span>
                                            ) : (
                                                <span className="text-muted-foreground/30">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.question_type === 'numeric' ? (
                                                <Badge variant="secondary" className="font-mono text-[10px] px-2 h-5">
                                                    {item.required_readings} Readings
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground/30">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
