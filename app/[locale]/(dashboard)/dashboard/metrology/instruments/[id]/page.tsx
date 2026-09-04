"use client"
import { useState } from "react"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { useInstrument } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/hooks/use-instruments"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, Printer, Loader2, AlertTriangle, ShieldCheck, Download, FileText, CheckCircle2, XCircle, FileCheck, Gauge, MapPin, Archive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useTranslations, useLocale } from 'next-intl'
import { CheckList } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/intermediate-checks/components/check-list"
import { CheckFormDialog } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/intermediate-checks/components/check-form-dialog"
import { AuditLogList } from "../../components/audit-log-list"
import { DriftChart } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/[id]/components/drift-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"

import { RecommendationAlert } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/[id]/components/recommendation-alert"
import { LifecycleTimeline } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/[id]/components/lifecycle-timeline"
import { MaintenanceList } from "@/app/[locale]/(dashboard)/dashboard/metrology/instruments/[id]/components/maintenance-list"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { downloadFile, cn } from "@/lib/utils"
import { AttachmentsList } from "@/features/system/components/attachments-list"

export default function InstrumentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const locale = useLocale()
    const id = params.id as string
    const [isPrinting, setIsPrinting] = useState(false)
    const [isExportingDossier, setIsExportingDossier] = useState(false)

    const { data: instrument, isLoading } = useInstrument(id)

    const handlePrintLabel = async () => {
        if (!instrument) return

        setIsPrinting(true)
        try {
            const blob = await apiClient.getBlob(`/instruments/${instrument.id}/label`)
            const url = window.URL.createObjectURL(blob)
            const printWindow = window.open(url, '_blank')
            if (!printWindow) {
                toast.error("Please allow popups to print the label")
            }
            setTimeout(() => window.URL.revokeObjectURL(url), 60000)
        } catch (error) {
            console.error('Failed to print label:', error)
            toast.error("Failed to download label")
        } finally {
            setIsPrinting(false)
        }
    }

    const handleDownloadDossier = async () => {
        if (!instrument) return
        
        setIsExportingDossier(true)
        try {
            await downloadFile(`/instruments/${instrument.id}/dossier`, `Dossie_Auditoria_${instrument.serial_number}.zip`)
            toast.success("Audit dossier generated and download started!")
        } catch (error) {
            console.error('Failed to export dossier:', error)
            toast.error("Failed to generate audit dossier")
        } finally {
            setIsExportingDossier(false)
        }
    }

    if (isLoading) return <div>Loading...</div>
    if (!instrument) return <div>Instrument not found</div>

    const nc = instrument.open_non_conformity
    const lastCalibration = instrument.calibrations?.[0]

    return (
        <Sheet>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                        title={instrument.name}
                        description={`SN: ${instrument.serial_number}`}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownloadDossier} 
                            disabled={isExportingDossier}
                            className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                        >
                            {isExportingDossier ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Archive className="mr-2 h-4 w-4" />
                            )}
                            Audit Dossier (ZIP)
                        </Button>

                        {lastCalibration && (
                            <Button 
                                variant="secondary" 
                                size="sm"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                onClick={() => downloadFile(`/calibrations/${lastCalibration.id}/pdf`, `Certificate_${instrument.serial_number}.pdf`)}
                            >
                                <FileCheck className="mr-2 h-4 w-4" /> Latest Certificate
                            </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={handlePrintLabel} disabled={isPrinting}>
                            {isPrinting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="mr-2 h-4 w-4" />
                            )}
                            Print Label
                        </Button>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Audit Log
                            </Button>
                        </SheetTrigger>
                        <Button size="sm" onClick={() => router.push(`/dashboard/metrology/instruments/${instrument.id}/edit`)}>
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
                    <AuditLogList auditableType="instrument" auditableId={id} />
                </SheetContent>

                {nc && (
                    <Alert variant="destructive" className="border-l-4 border-l-red-600 bg-red-50 dark:bg-red-950/20">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="ml-2">Non-Conformity Detected</AlertTitle>
                        <AlertDescription className="ml-2 flex items-center justify-between">
                            <span>
                                This instrument has an open non-conformity: <strong>{nc.title}</strong>.
                                <br />
                                Investigation and corrective action are required.
                            </span>
                            <Button variant="destructive" size="sm" asChild>
                                <Link href={`/dashboard/metrology/non-conformities/${nc.id}`}>
                                    Resolve Issue
                                </Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-3 overflow-hidden">
                        <CardHeader className="pb-4">
                            <RecommendationAlert
                                instrumentId={id}
                                currentFrequency={instrument.calibration_frequency || 12}
                            />
                            <div className="flex items-center justify-between mt-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Gauge className="h-5 w-5 text-primary" />
                                    Technical Specifications
                                </CardTitle>
                                <Badge className={cn(
                                    "px-3 py-1 text-sm font-semibold uppercase tracking-wider",
                                    instrument.status === 'active' ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                )}>
                                    {instrument.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="w-full lg:w-1/4 flex flex-col items-center">
                                    <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border bg-muted flex items-center justify-center group">
                                        {instrument.image_url ? (
                                            <Image
                                                src={instrument.image_url}
                                                alt={instrument.name}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Gauge className="h-12 w-12 opacity-20" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Photo Available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Manufacturer</p>
                                            <p className="text-sm font-semibold">{instrument.manufacturer}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Model</p>
                                            <p className="text-sm font-semibold">{instrument.model}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">NFC Signature</p>
                                            <p className="text-sm font-mono font-bold text-slate-600">{instrument.nfc_tag || 'Unassigned'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Range</p>
                                            <p className="text-sm font-bold text-primary">{instrument.range || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Resolution</p>
                                            <p className="text-sm font-bold text-primary">{instrument.precision || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">MPE (Tolerance)</p>
                                            <p className="text-sm font-black text-destructive">± {instrument.mpe || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Workstation</p>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                {instrument.station_id ? (
                                                    <Link 
                                                        href={`/dashboard/metrology/stations/${instrument.station_id}`}
                                                        className="text-sm font-bold text-blue-600 hover:underline"
                                                    >
                                                        {instrument.location}
                                                    </Link>
                                                ) : (
                                                    <p className="text-sm font-medium">{instrument.location}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Frequency</p>
                                            <p className="text-sm font-medium">{instrument.calibration_frequency} Months</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">Last Calibration</p>
                                            <p className="text-sm font-mono font-medium">{instrument.last_calibration_date || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1.5 lg:col-span-2 bg-primary/5 p-3 rounded-lg border border-primary/10 shadow-inner text-primary">
                                            <p className="text-[10px] font-black uppercase tracking-tighter">Next Due Date</p>
                                            <p className="text-base font-black font-mono leading-none mt-1">{instrument.next_calibration_date || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-3">
                        <Tabs defaultValue="calibrations" className="w-full">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="calibrations">Calibration History</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                                <TabsTrigger value="lifecycle">Life Cycle</TabsTrigger>
                                <TabsTrigger value="drift">Metrological Drift</TabsTrigger>
                                <TabsTrigger value="checks">Intermediate Checks</TabsTrigger>
                                <TabsTrigger value="attachments">Documents & Attachments</TabsTrigger>
                            </TabsList>

                            <TabsContent value="calibrations">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Calibration Certificates</CardTitle>
                                        <CardDescription>
                                            History of all official calibrations and generated documents.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Technician</TableHead>
                                                    <TableHead>Result</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {instrument.calibrations?.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                            No calibration records found.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    instrument.calibrations?.map((cal: any) => (
                                                        <TableRow key={cal.id}>
                                                            <TableCell className="font-medium">
                                                                {new Date(cal.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>{cal.technician}</TableCell>
                                                            <TableCell>
                                                                {cal.result === 'pass' ? (
                                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                                                                        <CheckCircle2 className="mr-1 h-3 w-3" /> PASS
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="destructive">
                                                                        <XCircle className="mr-1 h-3 w-3" /> FAIL
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button variant="ghost" size="sm" asChild>
                                                                        <Link href={`/dashboard/metrology/instruments/calibrations/${cal.id}`}>
                                                                            <FileText className="h-4 w-4 mr-2" /> Details
                                                                        </Link>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={() => downloadFile(`/calibrations/${cal.id}/pdf`, `Certificado_${cal.id}.pdf`)}
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" /> PDF
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="maintenance">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Maintenance & Adjustments</CardTitle>
                                        <CardDescription>History of технические intervenções.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <MaintenanceList instrumentId={id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="lifecycle">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Asset Narrative</CardTitle>
                                        <CardDescription>
                                            Chronological timeline of operational events and status changes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <LifecycleTimeline instrumentId={id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="drift">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stability & Error Trend</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            Visual analysis of measurement deviation over time.
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <DriftChart instrumentId={id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="checks">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle>Intermediate Checks</CardTitle>
                                            <div className="text-sm text-muted-foreground">
                                                Simplified verifications to ensure ongoing instrument confidence.
                                            </div>
                                        </div>
                                        <CheckFormDialog instrumentId={+id} />
                                    </CardHeader>
                                    <CardContent>
                                        <CheckList instrumentId={id} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="attachments">
                                <AttachmentsList 
                                    attachments={instrument.attachments || []} 
                                    attachableType="Modules\Metrology\Models\Instrument" 
                                    attachableId={instrument.id} 
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Sheet>
    )
}
