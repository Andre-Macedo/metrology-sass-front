"use client"

import { useState } from "react"
import { useNonConformities } from "@/features/non-conformities/hooks/use-non-conformities"
import { PageHeader } from "@/components/layout/page-header"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle, Eye, Download } from "lucide-react"
import { Link } from "@/i18n/routing"
import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

export default function NonConformitiesPage() {
    const t = useTranslations('NonConformities')
    const commonT = useTranslations('Common')
    const [status, setStatus] = useState<string>("open")
    const { data, isLoading } = useNonConformities({ status: status === 'all' ? undefined : status })

    const handleExport = async () => {
        try {
            const params = new URLSearchParams()
            if (status !== 'all') params.set('status', status)

            const blob = await apiClient.getBlob(`/metrology/non-conformities/export?${params.toString()}`)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `RNC_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success("Non-conformity report generated!")
        } catch (error) {
            toast.error("Failed to generate export")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'destructive';
            case 'investigating': return 'warning';
            case 'resolved': return 'default';
            case 'closed': return 'outline';
            default: return 'secondary';
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
            />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                </Button>
                <div className="w-[200px]">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('filter_status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('status_all')}</SelectItem>
                            <SelectItem value="open">{t('status_open')}</SelectItem>
                            <SelectItem value="investigating">{t('status_investigating')}</SelectItem>
                            <SelectItem value="resolved">{t('status_resolved')}</SelectItem>
                            <SelectItem value="closed">{t('status_closed')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table_id')}</TableHead>
                            <TableHead>{t('table_date')}</TableHead>
                            <TableHead>{t('table_item')}</TableHead>
                            <TableHead>{t('table_issue')}</TableHead>
                            <TableHead>{t('table_severity')}</TableHead>
                            <TableHead>{t('table_status')}</TableHead>
                            <TableHead className="text-right">{commonT('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {t('no_records')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((nc) => (
                                <TableRow key={nc.id}>
                                    <TableCell className="font-mono">#{nc.id}</TableCell>
                                    <TableCell>{nc.opened_at ? format(new Date(nc.opened_at), 'dd/MM/yyyy') : '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{nc.item_name || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground">{nc.item_type} - {nc.item_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={nc.title}>
                                        {nc.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={nc.severity === 'high' || nc.severity === 'critical' ? 'destructive' : 'secondary'}>
                                            {t(`severity_${nc.severity}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(nc.status) as any}>
                                            {t(`status_${nc.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/metrology/non-conformities/${nc.id}`}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t('manage')}
                                            </Link>
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
