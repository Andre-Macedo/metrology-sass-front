"use client"

import { useState } from "react"
import { useStandardImpact } from "@/features/standards"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, Download, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react"
import { downloadFile } from "@/lib/utils"
import { toast } from "sonner"

interface ImpactAnalysisListProps {
    standardId: string
}

export function ImpactAnalysisList({ standardId }: ImpactAnalysisListProps) {
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [isExportingPdf, setIsExportingPdf] = useState(false)

    const { data, isLoading } = useStandardImpact(standardId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
    })

    const handleExportPdf = async () => {
        setIsExportingPdf(true)
        try {
            const queryParams = new URLSearchParams()
            if (startDate) queryParams.set('start_date', startDate)
            if (endDate) queryParams.set('end_date', endDate)
            const query = queryParams.toString() ? `?${queryParams.toString()}` : ''

            await downloadFile(
                `/standards/${standardId}/impact-analysis/pdf${query}`,
                `Laudo_Impacto_Recall_Padrao_${standardId}.pdf`
            )
            toast.success("Laudo técnico de impacto metrológico (PDF) gerado com sucesso!")
        } catch (error) {
            console.error('Failed to export impact PDF:', error)
            toast.error("Falha ao emitir laudo de impacto metrológico.")
        } finally {
            setIsExportingPdf(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const calibrations = data?.data || []
    const stats = data?.stats

    return (
        <div className="space-y-4">
            {/* Filter and Export Bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-muted/20 p-4 rounded-lg border">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data Inicial</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-background h-9 text-xs"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Data Final</label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-background h-9 text-xs"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleExportPdf}
                        disabled={isExportingPdf || calibrations.length === 0}
                        className="font-semibold shadow-sm"
                    >
                        {isExportingPdf ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Exportar Laudo de Impacto & Recall (PDF)
                    </Button>
                </div>
            </div>

            {/* Severity & Risk Breakdown Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-muted/40 p-3 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Calibrações</span>
                        <span className="text-lg font-mono font-bold">{stats.total_calibrations}</span>
                    </div>

                    <div className="bg-muted/40 p-3 rounded-lg border text-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Instrumentos</span>
                        <span className="text-lg font-mono font-bold">{stats.unique_instruments}</span>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 p-3 rounded-lg text-center">
                        <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-400 block">Alto Risco (Recall)</span>
                        <span className="text-lg font-mono font-bold text-red-700 dark:text-red-400">{stats.critical_count}</span>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 rounded-lg text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Médio Risco</span>
                        <span className="text-lg font-mono font-bold text-amber-700 dark:text-amber-400">{stats.moderate_count}</span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 p-3 rounded-lg text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Baixo Risco</span>
                        <span className="text-lg font-mono font-bold text-emerald-700 dark:text-emerald-400">{stats.low_count}</span>
                    </div>
                </div>
            )}

            {/* Forensic Impact Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Certificado</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Instrumento / Tag</TableHead>
                            <TableHead>Posto / Local</TableHead>
                            <TableHead>MPE / Incerteza</TableHead>
                            <TableHead>TUR</TableHead>
                            <TableHead>Risco Metrológico</TableHead>
                            <TableHead>Ação Recomendada</TableHead>
                            <TableHead className="text-right">Certificado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {calibrations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                    Nenhuma calibração encontrada utilizando este padrão no período selecionado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            calibrations.map((cal: any) => (
                                <TableRow key={cal.calibration_id || cal.id}>
                                    <TableCell className="font-mono text-xs font-semibold">
                                        {cal.cert_code || `CERT-${cal.id}`}
                                    </TableCell>
                                    <TableCell className="text-xs">{cal.date}</TableCell>
                                    <TableCell className="font-medium text-xs">
                                        <div>{cal.instrument_name}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">
                                            Tag: {cal.tag || '-'} | SN: {cal.serial || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs">{cal.location || '-'}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {cal.mpe ? `±${cal.mpe}` : '-'} / {cal.uncertainty ? `±${cal.uncertainty}` : '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-semibold">
                                        {cal.tur ? Number(cal.tur).toFixed(1) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {cal.risk === 'CRITICAL' ? (
                                            <Badge variant="destructive" className="text-[10px] uppercase font-bold animate-pulse">
                                                <ShieldAlert className="h-3 w-3 mr-1" />
                                                Alto Risco
                                            </Badge>
                                        ) : cal.risk === 'MODERATE' ? (
                                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px] uppercase font-semibold">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Médio Risco
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-[10px] uppercase font-semibold">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Baixo Risco
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-[11px] font-semibold ${
                                            cal.risk === 'CRITICAL' ? 'text-red-600' : cal.risk === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'
                                        }`}>
                                            {cal.action || '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => downloadFile(`/calibrations/${cal.calibration_id || cal.id}/pdf`, `Certificate_${cal.cert_code || cal.id}.pdf`)}
                                        >
                                            <FileText className="h-4 w-4 mr-1 text-primary" />
                                            PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
