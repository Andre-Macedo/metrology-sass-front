"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Certificate } from "@/lib/types"
import { fetchCertificates } from "@/lib/api/calibrations"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { ShieldCheck, Download, Ban } from "lucide-react"
import { downloadFile } from "@/lib/utils"
import { useTranslations } from "next-intl"

export default function CertificatesPage() {
    const t = useTranslations('Certificates')
    const [data, setData] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const result = await fetchCertificates()
                setData(result)
            } catch (error) {
                console.error("Failed to load certificates", error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
            />

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.cert_id')}</TableHead>
                            <TableHead>{t('table.cal_id')}</TableHead>
                            <TableHead>{t('table.instrument')}</TableHead>
                            <TableHead>{t('table.issue_date')}</TableHead>
                            <TableHead>{t('table.hash')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : data.map((cert) => (
                            <TableRow key={cert.id}>
                                <TableCell className="font-mono text-sm font-bold">{cert.id}</TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">{cert.calibration_id}</TableCell>
                                <TableCell>{cert.instrument_name}</TableCell>
                                <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <code className="bg-muted px-2 py-1 rounded text-xs">
                                        {cert.hash}
                                    </code>
                                </TableCell>
                                <TableCell>
                                    {cert.status === 'valid' ? (
                                        <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950">
                                            <ShieldCheck className="mr-1 h-3 w-3" /> {t('table.valid')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            <Ban className="mr-1 h-3 w-3" /> {t('table.revoked')}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => downloadFile(`/calibrations/${cert.calibration_id}/pdf`, `Certificate_${cert.id}.pdf`)}
                                    >
                                        <Download className="mr-2 h-4 w-4" /> {t('table.download')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
