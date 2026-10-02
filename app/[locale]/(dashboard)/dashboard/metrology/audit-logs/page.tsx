"use client"

import { useState } from "react"
import { PageHeader } from '@/components/layout/page-header'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { AuditLog } from "@/app/[locale]/(dashboard)/dashboard/metrology/lib/audit-log-schema"
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PaginationState } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ShieldCheck, ShieldAlert, Loader2, CheckCircle2, Lock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ChainVerificationReport {
    is_valid: boolean
    total_records: number
    status: string
    genesis_hash: string
    chain_head_hash: string | null
    latest_sequence: number | null
    verified_at: string
    errors: Array<{
        type: string
        message: string
        record_id?: string
        sequence?: number
    }>
}

export default function GlobalAuditLogsPage() {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    const [isVerifying, setIsVerifying] = useState(false)
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [verificationReport, setVerificationReport] = useState<ChainVerificationReport | null>(null)

    const { data: queryData, isLoading } = useQuery({
        queryKey: ['system', 'audit-logs', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                page: (pagination.pageIndex + 1).toString(),
                per_page: pagination.pageSize.toString()
            })

            return await apiClient.get<{ data: AuditLog[]; current_page: number; last_page: number; total: number }>(
                `/audit-logs?${queryParams.toString()}`
            )
        },
    })

    const handleVerifyChain = async () => {
        setIsVerifying(true)
        try {
            const report = await apiClient.get<ChainVerificationReport>('/audit-logs/verify-chain')
            setVerificationReport(report)
            setReportModalOpen(true)
            if (report.is_valid) {
                toast.success("Cadeia de auditoria verificada com sucesso! 100% Íntegra.")
            } else {
                toast.error("Alerta Crítico: Cadeia de auditoria comprometida!")
            }
        } catch (error) {
            console.error('Failed to verify audit chain:', error)
            toast.error("Falha ao comunicar com o serviço de verificação forense.")
        } finally {
            setIsVerifying(false)
        }
    }

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "sequence_number",
            header: "Bloco / Hash Forense",
            cell: ({ row }) => {
                const seq = row.original.sequence_number
                const hash = row.original.record_hash
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-bold text-primary">
                            {seq ? `#${seq}` : '-'}
                        </span>
                        {hash ? (
                            <span
                                className="font-mono text-[10px] text-muted-foreground truncate max-w-[110px]"
                                title={`SHA-256: ${hash}`}
                            >
                                {hash.slice(0, 8)}...{hash.slice(-4)}
                            </span>
                        ) : (
                            <span className="text-[10px] text-muted-foreground italic">Legacy</span>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: "formatted_date",
            header: "Data / Hora",
            cell: ({ row }) => <span className="text-xs">{row.original.formatted_date}</span>
        },
        {
            accessorKey: "user_name",
            header: "Usuário",
            cell: ({ row }) => <span className="font-medium text-xs">{row.original.user_name}</span>
        },
        {
            accessorKey: "auditable_type",
            header: "Recurso / Módulo",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-xs">{row.original.auditable_type || 'System'}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {row.original.auditable_id || '-'}</span>
                </div>
            )
        },
        {
            accessorKey: "event",
            header: "Evento",
            cell: ({ row }) => (
                <Badge variant={
                    row.original.event === 'created' ? 'default' :
                    row.original.event === 'deleted' ? 'destructive' :
                    'outline'
                } className="text-[10px] uppercase font-semibold">
                    {row.original.event.toUpperCase()}
                </Badge>
            )
        },
        {
            id: "changes",
            header: "Modificações Registradas",
            cell: ({ row }) => {
                const log = row.original
                if (log.event === 'created') return <span className="text-muted-foreground italic text-xs">Novo Registro Criado</span>
                if (log.event === 'deleted') return <span className="text-destructive italic text-xs">Registro Excluído</span>

                if (!log.new_values) return '-'

                return (
                    <div className="space-y-1 text-xs max-w-md">
                        {Object.entries(log.new_values).slice(0, 3).map(([key, value]) => {
                            const oldValue = log.old_values?.[key]
                            if (!value && !oldValue) return null

                            return (
                                <div key={key} className="grid grid-cols-[auto,1fr] gap-2 items-start">
                                    <span className="font-medium text-muted-foreground">{key}:</span>
                                    <div className="flex flex-col text-[11px]">
                                        <span className="line-through text-red-400">{String(oldValue ?? 'null')}</span>
                                        <span className="text-green-600 font-semibold">{String(value ?? 'null')}</span>
                                    </div>
                                </div>
                            )
                        })}
                        {Object.keys(log.new_values).length > 3 && (
                            <div className="text-[10px] text-muted-foreground italic">
                                + {Object.keys(log.new_values).length - 3} outras propriedades
                            </div>
                        )}
                    </div>
                )
            }
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Trilha de Auditoria Forense"
                    description="Rastreabilidade imutável e encadeamento criptográfico SHA-256 (ISO/IEC 17025 e FDA 21 CFR Part 11)."
                />
                <Button
                    onClick={handleVerifyChain}
                    disabled={isVerifying}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shrink-0"
                >
                    {isVerifying ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    Verificar Integridade da Cadeia
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <DataTable
                    columns={columns}
                    data={queryData?.data || []}
                    isLoading={isLoading}
                    rowCount={queryData?.total || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>

            {/* Cryptographic Chain Integrity Verification Modal */}
            <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
                <DialogContent className="sm:max-w-[620px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {verificationReport?.is_valid ? (
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <ShieldAlert className="h-6 w-6 text-red-600" />
                            )}
                            <DialogTitle className="text-lg">
                                {verificationReport?.is_valid
                                    ? "Cadeia Forense 100% Íntegra"
                                    : "Alerta Crítico: Cadeia Comprometida"}
                            </DialogTitle>
                        </div>
                        <DialogDescription>
                            Validação criptográfica sequencial bloco-a-bloco conforme padrões FDA 21 CFR Part 11 e ISO/IEC 17025.
                        </DialogDescription>
                    </DialogHeader>

                    {verificationReport && (
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Status</span>
                                    <span className={`text-xs font-bold ${verificationReport.is_valid ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {verificationReport.is_valid ? 'Íntegro (HEALTHY)' : 'Comprometido (TAMPERED)'}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-lg border bg-muted/40 text-center">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Blocos Auditados</span>
                                    <span className="text-sm font-mono font-bold">{verificationReport.total_records}</span>
                                </div>
                                <div className="p-2.5 rounded-lg border bg-muted/40 text-center col-span-2 sm:col-span-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Último Bloco</span>
                                    <span className="text-sm font-mono font-bold">#{verificationReport.latest_sequence ?? 0}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="font-bold text-muted-foreground block">Hash do Bloco Gênesis:</span>
                                    <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded block truncate">
                                        {verificationReport.genesis_hash}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold text-muted-foreground block">Hash do Topo da Cadeia (Chain Head):</span>
                                    <span className="font-mono text-[11px] bg-muted px-2 py-1 rounded block truncate text-primary font-bold">
                                        {verificationReport.chain_head_hash || 'Sem registros encadeados'}
                                    </span>
                                </div>
                            </div>

                            {verificationReport.errors.length > 0 && (
                                <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                        Inconsistências Detectadas:
                                    </div>
                                    <ul className="list-disc pl-4 text-xs text-red-700 dark:text-red-300 space-y-1">
                                        {verificationReport.errors.map((err, i) => (
                                            <li key={i}>{err.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={() => setReportModalOpen(false)}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
