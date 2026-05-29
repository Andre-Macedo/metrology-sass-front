"use client"

import { useParams, useRouter } from "next/navigation"
import { useCalibration } from "@/app/[locale]/(dashboard)/dashboard/metrology/calibrations/hooks/use-calibrations"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, ArrowLeft, GitMerge } from "lucide-react"
import { TraceabilityGraph } from "./components/traceability-graph"
import { format } from "date-fns"

export default function CalibrationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: calibration, isLoading } = useCalibration(id)

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    if (!calibration) return <div>Calibration not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Calibration #{calibration.id}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span>{calibration.calibrated_item_name}</span>
                            <span>•</span>
                            <span>{format(new Date(calibration.date), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant={calibration.result === 'approved' ? 'default' : 'destructive'} className="text-sm px-3">
                        {calibration.result.toUpperCase()}
                    </Badge>
                    {calibration.certificate_url && (
                        <Button variant="outline" asChild>
                            <a href={calibration.certificate_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="mr-2 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Certificate Details</TabsTrigger>
                    <TabsTrigger value="traceability" className="gap-2">
                        <GitMerge className="h-4 w-4" />
                        Traceability Chain
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Final Deviation</p>
                                        <p className="text-lg font-mono">{calibration.deviation ?? '-'} mm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Uncertainty (U)</p>
                                        <p className="text-lg font-mono">{calibration.uncertainty ?? '-'} mm</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">k Factor</p>
                                        <p className="font-mono">{calibration.k_factor ?? '2.00'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Technician</p>
                                        <p>{calibration.technician}</p>
                                    </div>
                                </div>
                                
                                {/* As Found / As Left Details */}
                                {(calibration.as_found_deviation || calibration.as_left_deviation) && (
                                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                        <div className="bg-muted/30 p-3 rounded-md border">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">As Found (Recebimento)</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Deviation: <span className="font-mono">{calibration.as_found_deviation ?? '-'}</span></span>
                                                {calibration.as_found_result && (
                                                    <Badge variant="outline" className="text-[10px]">{calibration.as_found_result.toUpperCase()}</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md border">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">As Left (Ajustado)</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Deviation: <span className="font-mono">{calibration.as_left_deviation ?? '-'}</span></span>
                                                {calibration.as_left_result && (
                                                    <Badge variant="outline" className="text-[10px]">{calibration.as_left_result.toUpperCase()}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Environment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                                        <p>{calibration.temperature ? `${calibration.temperature} °C` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Humidity</p>
                                        <p>{calibration.humidity ? `${calibration.humidity} %` : '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="traceability" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metrological Traceability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TraceabilityGraph calibrationId={id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}