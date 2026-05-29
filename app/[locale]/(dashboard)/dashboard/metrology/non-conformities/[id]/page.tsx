"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useNonConformity, useUpdateNonConformity, useCloseNonConformity } from "@/features/non-conformities/hooks/use-non-conformities"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export default function NonConformityDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const t = useTranslations('NonConformities')
    const commonT = useTranslations('Common')

    const { data: nc, isLoading } = useNonConformity(id)
    const updateMutation = useUpdateNonConformity()
    const closeMutation = useCloseNonConformity()

    const [formData, setFormData] = useState({
        root_cause_analysis: "",
        immediate_action: "",
        corrective_action: "",
        preventive_action: "",
        status: "open"
    })

    useEffect(() => {
        if (nc) {
            setFormData({
                root_cause_analysis: nc.root_cause_analysis || "",
                immediate_action: nc.immediate_action || "",
                corrective_action: nc.corrective_action || "",
                preventive_action: nc.preventive_action || "",
                status: nc.status
            })
        }
    }, [nc])

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    if (!nc) return <div className="p-8 text-center text-muted-foreground">{t('not_found')}</div>

    const handleSave = () => {
        updateMutation.mutate({ id, data: formData }, {
            onSuccess: () => toast.success(t('messages_updated_success'))
        })
    }

    const handleClose = () => {
        if (!formData.root_cause_analysis || !formData.corrective_action) {
            toast.error(t('messages_close_requirements'))
            return
        }
        closeMutation.mutate({ id, resolution: formData.corrective_action }, {
            onSuccess: () => toast.success(t('messages_closed_success'))
        })
    }

    const isClosed = nc.status === 'closed'

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">RNC #{nc.id}</h1>
                        <p className="text-muted-foreground">{nc.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isClosed && (
                        <>
                            <Button variant="outline" onClick={handleSave} disabled={updateMutation.isPending}>
                                <Save className="mr-2 h-4 w-4" />
                                {t('save_draft')}
                            </Button>
                            <Button onClick={handleClose} disabled={closeMutation.isPending} variant="default">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {t('close_nc')}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('details_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">{t('table_status')}</Label>
                                <div className="mt-1">
                                    <Badge variant={isClosed ? 'outline' : 'destructive'}>{t(`status_${nc.status}`)}</Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t('table_severity')}</Label>
                                <div className="mt-1">
                                    <Badge variant={nc.severity === 'high' || nc.severity === 'critical' ? 'destructive' : 'secondary'}>{t(`severity_${nc.severity}`)}</Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t('table_item')}</Label>
                                <p className="font-medium">{nc.item_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{nc.item_type} - {nc.item_id}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">{t('description_label')}</Label>
                                <p className="text-sm mt-1 bg-muted/50 p-3 rounded border">{nc.description || t('no_description')}</p>
                            </div>
                            {!isClosed && (
                                <div>
                                    <Label>{t('update_status')}</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(v) => setFormData({...formData, status: v})}
                                        disabled={isClosed}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">{t('status_open')}</SelectItem>
                                            <SelectItem value="investigating">{t('status_investigating')}</SelectItem>
                                            <SelectItem value="resolved">{t('status_resolved')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Investigation (CAPA) */}
                <div className="md:col-span-2 space-y-6">
                    <Card className={isClosed ? "opacity-80 pointer-events-none" : ""}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                {t('capa_title')}
                            </CardTitle>
                            <CardDescription>
                                {t('capa_description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t('root_cause')}</Label>
                                <Textarea 
                                    placeholder={t('root_cause_placeholder')}
                                    value={formData.root_cause_analysis}
                                    onChange={(e) => setFormData({...formData, root_cause_analysis: e.target.value})}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('immediate_action')}</Label>
                                <Textarea 
                                    placeholder={t('immediate_action_placeholder')}
                                    value={formData.immediate_action}
                                    onChange={(e) => setFormData({...formData, immediate_action: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('corrective_action')}</Label>
                                    <Textarea 
                                        placeholder={t('corrective_action_placeholder')}
                                        value={formData.corrective_action}
                                        onChange={(e) => setFormData({...formData, corrective_action: e.target.value})}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('preventive_action')}</Label>
                                    <Textarea 
                                        placeholder={t('preventive_action_placeholder')}
                                        value={formData.preventive_action}
                                        onChange={(e) => setFormData({...formData, preventive_action: e.target.value})}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
