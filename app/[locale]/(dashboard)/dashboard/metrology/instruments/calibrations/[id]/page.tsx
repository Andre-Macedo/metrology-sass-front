"use client"

import { PageHeader } from "@/components/layout/page-header"
import { getCalibration } from "@/lib/api/calibrations"
import { Calibration } from "@/lib/types"
import { useParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
    Edit, 
    ArrowLeft, 
    Download, 
    FileSpreadsheet, 
    Calendar, 
    User, 
    Thermometer, 
    Droplets, 
    ShieldCheck, 
    History, 
    Network,
    FileCheck,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Gauge,
    Info,
    Loader2,
    Target,
    Activity,
    Scale,
    Ruler
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { UncertaintyBudgetModal } from "@/components/metrology/uncertainty-budget-modal"
import { downloadFile, cn } from "@/lib/utils"
import { useRouter, Link } from "@/i18n/routing"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TraceabilityGraph } from "@/features/calibrations"
import { AuditLogList } from "@/app/[locale]/(dashboard)/dashboard/metrology/components/audit-log-list"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts'

export default function CalibrationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('Instruments')
    const [calibration, setCalibration] = useState<Calibration | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (params.id) {
                const data = await getCalibration(params.id as string)
                if (data) setCalibration(data)
                setLoading(false)
            }
        }
        load()
    }, [params.id])

    if (loading) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Loading technical data...</p>
        </div>
    )
    
    if (!calibration) return (
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg font-medium">Calibration record not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
        </div>
    )

    const getResultBadge = (result: string) => {
        const r = result?.toLowerCase()
        if (['pass', 'approved'].includes(r)) return (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1.5 px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pass
            </Badge>
        )
        if (['fail', 'rejected'].includes(r)) return (
            <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                <XCircle className="h-3.5 w-3.5" /> Fail
            </Badge>
        )
        if (r === 'conditional_pass') return (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 gap-1.5 px-3 py-1">
                <AlertCircle className="h-3.5 w-3.5" /> Conditional
            </Badge>
        )
        return <Badge variant="outline" className="px-3 py-1">{result}</Badge>
    }

    const chartData = calibration.checklist_items
        ?.filter(item => item.question_type === 'numeric' && item.error !== undefined && item.error !== null)
        .map(item => ({
            name: item.step,
            nominal: item.nominal_value,
            error: item.error,
            mpe: calibration.calibrated_item?.mpe_value || 0,
            negMpe: -(calibration.calibrated_item?.mpe_value || 0)
        })) || []

    return (
        <Sheet>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                        title={`Calibration #${calibration.id}`}
                        description={`For ${calibration.calibrated_item_name || calibration.instrument_name}`}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadFile(`/calibrations/${calibration.id}/export`, `Report_${calibration.id}.xlsx`)}>
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Export Excel
                        </Button>
                        {calibration.certificate_url && (
                            <Button variant="outline" size="sm" onClick={() => downloadFile(`/calibrations/${calibration.id}/pdf`, `Cert_${calibration.id}.pdf`)}>
                                <Download className="mr-2 h-4 w-4 text-blue-600" /> Download PDF
                            </Button>
                        )}
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Audit Log
                            </Button>
                        </SheetTrigger>
                        <Button size="sm" onClick={() => router.push(`/dashboard/metrology/instruments/calibrations/${calibration.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </div>
                </div>

                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Data Integrity Audit Trail
                        </SheetTitle>
                        <CardDescription>
                            Technical logs of all attribute changes for compliance (CFR 21 Part 11).
                        </CardDescription>
                    </SheetHeader>
                    <AuditLogList auditableType="calibration" auditableId={params.id as string} />
                </SheetContent>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Executive Summary Card */}
                    <Card className="md:col-span-3 overflow-hidden border-l-4 border-l-primary shadow-md">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" />
                                    Execution Overview
                                </CardTitle>
                                {getResultBadge(calibration.result)}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <User className="h-3 w-3" /> Technician
                                    </div>
                                    <p className="font-semibold">{calibration.technician}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <Calendar className="h-3 w-3" /> Date Executed
                                    </div>
                                    <p className="font-semibold font-mono">{calibration.date}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <Gauge className="h-3 w-3" /> Asset Tag
                                    </div>
                                    <p className="font-semibold font-mono text-primary">{calibration.calibrated_item?.serial_number || calibration.calibrated_item_id || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <History className="h-3 w-3" /> Next Due
                                    </div>
                                    <p className="font-bold text-primary font-mono">{calibration.next_due_date || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <Thermometer className="h-3 w-3" /> Temperature
                                    </div>
                                    <p className="font-semibold">{calibration.temperature ?? 'N/A'} <span className="text-xs text-muted-foreground">°C</span></p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <Droplets className="h-3 w-3" /> Humidity
                                    </div>
                                    <p className="font-semibold">{calibration.humidity ?? 'N/A'} <span className="text-xs text-muted-foreground">%</span></p>
                                </div>
                                <div className="space-y-1 lg:col-span-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                        <Target className="h-3 w-3" /> Decision Rule
                                    </div>
                                    <p className="font-semibold text-sm">{calibration.decision_rule || 'Simple Acceptance (ISO 14253-1)'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tech Specs Card */}
                    <Card className="shadow-md flex flex-col">
                        <CardHeader className="pb-2 bg-slate-50">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-slate-500" />
                                Technical Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Measuring Range:</span>
                                <span className="font-mono font-bold">{calibration.calibrated_item?.range || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Resolution:</span>
                                <span className="font-mono font-bold">{calibration.calibrated_item?.resolution || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">MPE (Limit):</span>
                                <span className="font-mono font-bold text-amber-700">± {calibration.calibrated_item?.mpe || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t pt-2">
                                <span className="text-muted-foreground font-medium">Max Error Found:</span>
                                <span className={cn(
                                    "font-mono font-bold",
                                    Math.abs(calibration.deviation || 0) > (calibration.calibrated_item?.mpe_value || 0) ? "text-red-600" : "text-green-600"
                                )}>
                                    {calibration.deviation !== undefined ? (calibration.deviation > 0 ? `+${calibration.deviation.toFixed(4)}` : calibration.deviation.toFixed(4)) : 'N/A'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Graph Card */}
                    <Card className="md:col-span-2 shadow-md">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Error Deviation Chart
                            </CardTitle>
                            <CardDescription className="text-[10px]">Comparing found errors vs. MPE limits</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] pt-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <ChartTooltip 
                                            contentStyle={{ fontSize: '10px', borderRadius: '8px' }}
                                            formatter={(value: any) => [parseFloat(value).toFixed(4), '']}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="error" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Measured Error" />
                                        <Line type="step" dataKey="mpe" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="+MPE Limit" />
                                        <Line type="step" dataKey="negMpe" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="-MPE Limit" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs italic">
                                    Insufficient numeric data for charting
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Uncertainty Budget Card */}
                    <Card className="md:col-span-2 shadow-md">
                        <CardHeader className="pb-2 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-blue-600" />
                                    ISO GUM Uncertainty Budget
                                </CardTitle>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Expanded Uncertainty (U)</p>
                                    <p className="text-lg font-black font-mono text-primary leading-none">± {calibration.uncertainty ?? '0.00'}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-[10px] text-left">
                                <thead className="bg-muted/50 border-y">
                                    <tr>
                                        <th className="px-4 py-2">Source of Uncertainty</th>
                                        <th className="px-2 py-2 text-center">Value</th>
                                        <th className="px-2 py-2 text-center">Divisor</th>
                                        <th className="px-2 py-2 text-center">Dist.</th>
                                        <th className="px-4 py-2 text-right">Standard u(x)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calibration.uncertainty_budget?.map((item, idx) => (
                                        <tr key={idx} className="border-b last:border-0">
                                            <td className="px-4 py-2 font-medium">{item.source}</td>
                                            <td className="px-2 py-2 text-center font-mono">{item.value.toFixed(5)}</td>
                                            <td className="px-2 py-2 text-center font-mono">{item.divisor.toFixed(3)}</td>
                                            <td className="px-2 py-2 text-center uppercase">{item.distribution.substring(0,3)}</td>
                                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-700">{item.standard_uncertainty.toFixed(5)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-primary/5">
                                        <td colSpan={4} className="px-4 py-2 text-right font-bold uppercase tracking-tighter">Combined Uncertainty (uc)</td>
                                        <td className="px-4 py-2 text-right font-black font-mono text-primary">
                                            {((calibration.uncertainty || 0) / (calibration.k_factor || 2)).toFixed(5)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="p-2 border-t flex justify-between items-center">
                                <span className="text-[9px] text-muted-foreground italic">Coverage Factor k = {calibration.k_factor || 2.00} (95.45% Confidence)</span>
                                <UncertaintyBudgetModal 
                                    budget={calibration.uncertainty_budget || []}
                                    expandedUncertainty={calibration.uncertainty}
                                    kFactor={calibration.k_factor || 2}
                                    trigger={<Button variant="link" className="h-6 p-0 text-[10px]">More Details</Button>}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary Data Tabs */}
                    <div className="md:col-span-4 mt-4">
                        <Tabs defaultValue="results" className="w-full">
                            <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 border">
                                <TabsTrigger value="results" className="gap-2 px-6">
                                    <Gauge className="h-4 w-4" /> Measurements
                                </TabsTrigger>
                                <TabsTrigger value="traceability" className="gap-2 px-6">
                                    <Network className="h-4 w-4" /> Traceability Chain
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="results" className="mt-4 animate-in fade-in zoom-in-95">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            Metrological Data Items
                                        </CardTitle>
                                        <CardDescription>Detailed step-by-step verification results.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {calibration.checklist_items && calibration.checklist_items.length > 0 ? (
                                            <div className="relative overflow-hidden rounded-lg border">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-muted-foreground uppercase bg-muted/80">
                                                        <tr>
                                                            <th className="px-6 py-3 font-bold">Step Description</th>
                                                            <th className="px-4 py-3 text-center">Nominal</th>
                                                            <th className="px-6 py-3">Observations / Readings</th>
                                                            <th className="px-4 py-3 text-center">Error</th>
                                                            <th className="px-4 py-3 text-center">Uncertainty</th>
                                                            <th className="px-4 py-3">Ref. Standard</th>
                                                            <th className="px-6 py-3 text-right">Verdict</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {calibration.checklist_items.map((item, idx) => {
                                                            const isNumeric = item.question_type === 'numeric'
                                                            const isPass = ['pass', 'approved', '1', 'true', 'ok', 'yes'].includes(item.result?.toLowerCase())

                                                            return (
                                                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="font-semibold text-slate-900">{item.step}</div>
                                                                        {item.question_type !== 'numeric' && (
                                                                            <Badge variant="outline" className="mt-1 text-[9px] h-4 uppercase font-bold tracking-tighter opacity-70">
                                                                                {item.question_type}
                                                                            </Badge>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-center font-mono font-medium">
                                                                        {isNumeric ? item.nominal_value : <span className="text-muted-foreground/30">—</span>}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-mono text-xs">
                                                                        {isNumeric && (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {(item.readings_formatted || item.as_found_readings?.join(' | ')) || 'No data'}
                                                                            </div>
                                                                        )}
                                                                        {item.question_type === 'text' && <span className="text-muted-foreground italic font-sans">{item.notes || 'No notes provided'}</span>}
                                                                        {item.question_type === 'boolean' && <span className="text-muted-foreground/50">Attribute Check</span>}
                                                                    </td>
                                                                    <td className={cn(
                                                                        "px-4 py-4 text-center font-mono font-bold",
                                                                        item.error !== undefined && Math.abs(item.error) > 0 ? "text-amber-600" : "text-muted-foreground/40"
                                                                    )}>
                                                                        {item.error !== undefined && item.error !== null ? (item.error > 0 ? `+${item.error.toFixed(4)}` : item.error.toFixed(4)) : <span className="text-muted-foreground/20">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-center text-muted-foreground font-mono">
                                                                        {item.uncertainty ?? <span className="text-muted-foreground/20">—</span>}
                                                                    </td>
                                                                    <td className="px-4 py-4">
                                                                        {item.reference_standard ? (
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] font-bold truncate max-w-[120px]" title={item.reference_standard.name}>{item.reference_standard.name}</span>
                                                                                <span className="text-[9px] text-muted-foreground font-mono">{item.reference_standard.serial_number}</span>
                                                                            </div>
                                                                        ) : <span className="text-muted-foreground/20">—</span>}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex justify-end items-center gap-1.5 font-bold">
                                                                            {isPass ? (
                                                                                <span className="text-green-600 flex items-center gap-1 uppercase tracking-tight text-xs">
                                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> OK
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-red-600 flex items-center gap-1 uppercase tracking-tight text-xs">
                                                                                    <XCircle className="h-3.5 w-3.5" /> Error
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                                                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                                                <p className="text-muted-foreground">No detailed measurement data available for this record.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="traceability" className="mt-4 animate-in fade-in slide-in-from-left-2">
                                <Card className="shadow-md">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Network className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Metrological Traceability Chain</CardTitle>
                                                <CardDescription>Hierarchy of standards used for this calibration (SI units traceability).</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <TraceabilityGraph calibrationId={params.id as string} />
                                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border text-[11px] text-muted-foreground flex gap-3 italic">
                                            <Info className="h-4 w-4 shrink-0 text-primary opacity-50" />
                                            <span>
                                                The graph above displays the metrological connection between this instrument and the reference standards used during the execution. 
                                                Dashed nodes represent external calibrations (accredited labs), while solid nodes represent internal master standards.
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Sheet>
    )
}
