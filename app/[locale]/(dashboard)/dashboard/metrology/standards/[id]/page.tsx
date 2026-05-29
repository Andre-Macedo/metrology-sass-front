"use client"

import { PageHeader } from "@/components/layout/page-header"
import { useStandard } from "@/app/[locale]/(dashboard)/dashboard/metrology/standards/hooks/use-standards"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
    Edit, 
    ArrowLeft, 
    Activity, 
    AlertTriangle, 
    History, 
    ShieldCheck, 
    Download, 
    FileCheck, 
    Scale, 
    Layers, 
    Info, 
    FileText,
    Loader2,
    Calendar,
    Target,
    Box,
    MapPin,
    Hash
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditLogList } from "../../components/audit-log-list"
import { ImpactAnalysisList } from "./components/impact-analysis-list"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Link } from "@/i18n/routing"
import { AttachmentsList } from "@/features/system/components/attachments-list"
import { cn, downloadFile } from "@/lib/utils"
import { useTranslations } from "next-intl"

export default function StandardDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const t = useTranslations('Standards')
    const tCommon = useTranslations('Common')
    const id = params.id as string

    const { data: standard, isLoading } = useStandard(id)

    if (isLoading) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Carregando dados mestre do padrão...</p>
        </div>
    )

    if (!standard) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Padrão não encontrado</p>
            <Button onClick={() => router.back()}>Voltar</Button>
        </div>
    )

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'gauge_block': return t('types.gauge_block');
            case 'caliper_checker': return t('types.caliper_checker');
            case 'micrometer_standard': return t('types.micrometer_standard');
            default: return type || 'Other';
        }
    }

    const getStatusVariant = (status: string) => {
        const s = status?.toLowerCase()
        if (['active', 'calibrated'].includes(s)) return 'default'
        if (['expired', 'overdue'].includes(s)) return 'destructive'
        if (['maintenance', 'repair'].includes(s)) return 'warning'
        return 'secondary'
    }

    const nc = standard.open_non_conformity

    return (
        <Sheet>
            <div className="space-y-6">
                {/* Standardized Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <PageHeader
                            title={standard.name}
                            description={`NS: ${standard.serial_number}`}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {standard.certificate_url && (
                            <Button 
                                variant="secondary" 
                                size="sm"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                onClick={() => downloadFile(standard.certificate_url!, `Cert_${standard.serial_number}.pdf`)}
                            >
                                <FileCheck className="mr-2 h-4 w-4" /> Latest Certificate
                            </Button>
                        )}
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Audit Log
                            </Button>
                        </SheetTrigger>
                        <Button size="sm" onClick={() => router.push(`/dashboard/metrology/standards/${standard.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> {tCommon('edit')}
                        </Button>
                    </div>
                </div>

                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Standard Audit Trail
                        </SheetTitle>
                        <CardDescription>
                            Technical history of changes for this reference standard.
                        </CardDescription>
                    </SheetHeader>
                    <AuditLogList auditableType="standard" auditableId={id} />
                </SheetContent>

                {nc && (
                    <Alert variant="destructive" className="border-l-4 border-l-red-600 bg-red-50 dark:bg-red-950/20">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="ml-2">Non-Conformity Detected</AlertTitle>
                        <AlertDescription className="ml-2 flex items-center justify-between">
                            <span>
                                This standard has an open non-conformity: <strong>{nc.title}</strong>.
                                <br />
                                Direct use is prohibited until resolution.
                            </span>
                            <Button variant="destructive" size="sm" asChild>
                                <Link href={`/dashboard/metrology/non-conformities/${nc.id}`}>
                                    Resolve Issue
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Technical Specifications Card (Instrument Style) */}
                <Card className="overflow-hidden shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Scale className="h-5 w-5 text-primary" />
                                Technical Specifications
                            </CardTitle>
                            <Badge className={cn(
                                "px-3 py-1 text-sm font-semibold uppercase tracking-wider",
                                getStatusVariant(standard.status || '') === 'default' ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            )}>
                                {standard.status?.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Visual Icon Area */}
                            <div className="w-full lg:w-1/4 flex flex-col items-center">
                                <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border bg-muted flex items-center justify-center group">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Box className="h-16 w-16 opacity-20 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                            {standard.children?.length ? 'Kit / System' : 'Single Component'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Specs Grid */}
                            <div className="flex-1">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Manufacturer</p>
                                        <p className="text-sm font-semibold">{standard.manufacturer || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Asset Tag</p>
                                        <p className="text-sm font-mono font-bold text-slate-600">{standard.stock_number || standard.id}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Precision Grade</p>
                                        <p className="text-sm font-bold text-primary">{standard.grade || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Type</p>
                                        <p className="text-sm font-semibold">{getTypeLabel(standard.type || '')}</p>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Nominal Value</p>
                                        <p className="text-sm font-bold font-mono">{standard.nominal_value || '—'} {standard.unit}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Actual Value</p>
                                        <p className="text-sm font-black font-mono text-blue-600">{standard.actual_value || '—'} {standard.unit}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Uncertainty (U)</p>
                                        <p className="text-sm font-black font-mono text-destructive">± {standard.uncertainty || '0.000'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Frequency</p>
                                        <p className="text-sm font-medium">{standard.calibration_frequency_months || 24} Months</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Last Calibration</p>
                                        <p className="text-sm font-mono font-medium">{standard.last_calibration_date || 'No history'}</p>
                                    </div>
                                    <div className="space-y-1.5 lg:col-span-2 bg-primary/5 p-3 rounded-lg border border-primary/10 shadow-inner text-primary">
                                        <p className="text-[10px] font-black uppercase tracking-tighter">Next Due Date</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <p className="text-lg font-black font-mono">{standard.next_calibration_date || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <div className="mt-4">
                    <Tabs defaultValue={standard.children?.length ? "kit" : "impact"} className="w-full">
                        <TabsList className="bg-muted/50 border h-12 p-1">
                            {standard.children && standard.children.length > 0 && (
                                <TabsTrigger value="kit" className="gap-2 px-6">
                                    <Layers className="h-4 w-4" /> Kit Composition
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="impact" className="gap-2 px-6">
                                <Activity className="h-4 w-4" /> Impact Analysis
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-2 px-6">
                                <FileText className="h-4 w-4" /> External History
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="gap-2 px-6">
                                <Download className="h-4 w-4" /> Documents
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="kit" className="mt-6 animate-in fade-in zoom-in-95">
                            <Card className="shadow-md">
                                <CardHeader className="bg-slate-50/50 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Box className="h-5 w-5 text-primary" />
                                        Virtual Case Inventory
                                    </CardTitle>
                                    <CardDescription>Visual representation of items belonging to this kit.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {standard.children?.map(child => (
                                            <Link 
                                                key={child.id} 
                                                href={`/dashboard/metrology/standards/${child.id}`}
                                                className="group"
                                            >
                                                <div className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:shadow-md h-full",
                                                    child.status === 'rejected' ? "border-red-200 bg-red-50" : "border-slate-100 bg-slate-50 group-hover:border-primary/30"
                                                )}>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase group-hover:text-primary transition-colors">Nominal</span>
                                                    <span className="text-lg font-black font-mono">{child.nominal_value}</span>
                                                    <div className="mt-2 pt-2 border-t w-full text-center">
                                                        <span className="text-[10px] block font-mono text-primary font-bold">Real: {child.actual_value}</span>
                                                        {child.status === 'rejected' && <Badge className="mt-1 h-4 text-[8px] bg-red-600">REJECTED</Badge>}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="impact" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Reverse Traceability (Impact Analysis)</CardTitle>
                                    <CardDescription>
                                        Instruments calibrated using this standard. Essential for recall management in case of standard failure.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ImpactAnalysisList standardId={id} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-6 text-center py-12 border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground italic">
                            Calibration history listing for standards is coming soon.
                        </TabsContent>

                        <TabsContent value="attachments" className="mt-6">
                            <AttachmentsList 
                                attachments={standard.attachments || []} 
                                attachableType="Modules\Metrology\Models\ReferenceStandard" 
                                attachableId={Number(standard.id)} 
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Sheet>
    )
}
