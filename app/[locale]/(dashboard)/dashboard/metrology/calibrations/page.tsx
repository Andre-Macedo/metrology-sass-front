"use client"

import { useState } from "react"
import { 
    useCalibrations, 
    useApproveCalibration, 
    useRejectCalibration 
} from "@/features/calibrations"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, Eye, FileText, Plus, Search } from "lucide-react"
import { Link } from "@/i18n/routing"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useTranslations, useLocale } from "next-intl"
import { downloadFile } from "@/lib/utils"

export default function CalibrationsPage() {
    const t = useTranslations('Calibrations')
    const [activeTab, setActiveTab] = useState("history")
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageHeader
                    title={t('title')}
                    description={t('description')}
                />
                <Button asChild>
                    <Link href="/dashboard/metrology/calibrations/create">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('new_calibration')}
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="history">{t('tabs.history')}</TabsTrigger>
                    <TabsTrigger value="review" className="relative gap-2">
                        {t('tabs.review')}
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] flex items-center justify-center text-[10px]">
                            {t('tabs.pending')}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-4">
                    <CalibrationsTable />
                </TabsContent>

                <TabsContent value="review" className="mt-4">
                    <ReviewQueueTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function CalibrationsTable() {
    const t = useTranslations('Calibrations')
    const locale = useLocale()
    const dateLocale = locale === 'pt-BR' ? ptBR : enUS
    
    const [search, setSearch] = useState("")
    const { data, isLoading } = useCalibrations({ search, status: 'published' }) 

    return (
        <div className="space-y-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder={t('table.search_placeholder')} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.id')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.instrument')}</TableHead>
                            <TableHead>{t('table.result')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead className="text-right">{t('table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {t('table.no_records')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((cal) => (
                                <TableRow key={cal.id}>
                                    <TableCell className="font-mono text-xs">#{cal.id}</TableCell>
                                    <TableCell>{cal.date ? format(new Date(cal.date), 'dd/MM/yyyy', { locale: dateLocale }) : '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{cal.instrument_name}</span>
                                            <span className="text-xs text-muted-foreground">{cal.instrument_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            cal.result === 'pass' || cal.result === 'approved' ? 'default' : 
                                            cal.result === 'conditional' || cal.result === 'approved_with_restrictions' || cal.result === 'conditional_pass' ? 'secondary' :
                                            'destructive'
                                        }>
                                            {t(`result.${cal.result}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{t(`status.${cal.status}`)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/dashboard/metrology/calibrations/${cal.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t('table.view')}
                                                </Link>
                                            </Button>
                                            {cal.certificate_url && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => downloadFile(`/calibrations/${cal.id}/pdf`, `Certificate_${cal.id}.pdf`)}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    {t('table.cert')}
                                                </Button>
                                            )}
                                        </div>
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

function ReviewQueueTable() {
    const t = useTranslations('Calibrations')
    const locale = useLocale()
    const dateLocale = locale === 'pt-BR' ? ptBR : enUS

    const { data, isLoading } = useCalibrations({ status: 'in_review' })
    const approveMutation = useApproveCalibration()
    const rejectMutation = useRejectCalibration()

    const handleApprove = (id: string) => {
        approveMutation.mutate(id, {
            onSuccess: () => toast.success(t('messages.approved'))
        })
    }

    const handleReject = (id: string) => {
        rejectMutation.mutate(id, {
            onSuccess: () => toast.success(t('messages.rejected'))
        })
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="rounded-md border bg-muted/5">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('table.id')}</TableHead>
                        <TableHead>{t('table.date')}</TableHead>
                        <TableHead>{t('table.instrument')}</TableHead>
                        <TableHead>{t('table.technician')}</TableHead>
                        <TableHead>{t('table.result')}</TableHead>
                        <TableHead className="text-right">{t('table.review_actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle className="h-8 w-8 text-green-500/20" />
                                    <p>{t('table.all_caught_up')}</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.data.map((cal) => (
                            <TableRow key={cal.id} className="bg-background">
                                <TableCell className="font-mono text-xs">#{cal.id}</TableCell>
                                <TableCell>{cal.date ? format(new Date(cal.date), 'dd/MM/yyyy', { locale: dateLocale }) : '-'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{cal.instrument_name}</span>
                                        <span className="text-xs text-muted-foreground">{cal.instrument_id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{cal.technician}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        cal.result === 'pass' || cal.result === 'approved' ? 'default' : 
                                        cal.result === 'conditional' || cal.result === 'approved_with_restrictions' || cal.result === 'conditional_pass' ? 'secondary' :
                                        'destructive'
                                    }>
                                        {t(`result.${cal.result}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild title={t('tooltips.view_details')}>
                                            <Link href={`/dashboard/metrology/calibrations/${cal.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            onClick={() => handleApprove(cal.id)}
                                            disabled={approveMutation.isPending}
                                            title={t('tooltips.approve')}
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            onClick={() => handleReject(cal.id)}
                                            disabled={rejectMutation.isPending}
                                            title={t('tooltips.reject')}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
